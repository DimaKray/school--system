const pool = require("../config/db");

/*
 * SQL-запити для звітів і статистики успішності.
 * Використовуються JOIN, агрегатні функції (COUNT, AVG, MIN, MAX),
 * GROUP BY / HAVING, віконна функція RANK() та підзапити.
 * 12-бальна шкала: 1–3 початковий (незадовільний), 4–6 середній,
 * 7–9 достатній, 10–12 високий рівень.
 */

// Загальні показники школи
const getSummary = async () => {

    const result = await pool.query(`
        SELECT
            (SELECT COUNT(*) FROM students)::int  AS students_count,
            (SELECT COUNT(*) FROM teachers)::int  AS teachers_count,
            (SELECT COUNT(*) FROM classes)::int   AS classes_count,
            (SELECT COUNT(*) FROM subjects)::int  AS subjects_count,
            (SELECT COUNT(*) FROM grades)::int    AS grades_count,
            (SELECT ROUND(AVG(grade), 2) FROM grades) AS avg_grade,
            (SELECT COUNT(*) FROM grades WHERE grade <= 3)::int AS low_grades_count
    `);

    return result.rows[0];

};

// Середній бал кожного учня + рейтинг (RANK)
const getStudentAverages = async (classId = null, subjectId = null) => {

    const result = await pool.query(`
        SELECT
            s.id AS student_id,
            u.first_name,
            u.last_name,
            c.name AS class_name,
            COUNT(g.id)::int AS grades_count,
            ROUND(AVG(g.grade), 2) AS avg_grade,
            MIN(g.grade) AS min_grade,
            MAX(g.grade) AS max_grade,
            RANK() OVER (ORDER BY AVG(g.grade) DESC NULLS LAST)::int AS rank
        FROM students s
        JOIN users u ON u.id = s.user_id
        LEFT JOIN classes c ON c.id = s.class_id
        LEFT JOIN grades g
            ON g.student_id = s.id
           AND ($2::int IS NULL OR g.subject_id = $2::int)
        WHERE ($1::int IS NULL OR s.class_id = $1::int)
        GROUP BY s.id, u.first_name, u.last_name, c.name
        ORDER BY rank, u.last_name
    `, [classId, subjectId]);

    return result.rows;

};

// Середній бал академічного класу
const getClassAverages = async () => {

    const result = await pool.query(`
        SELECT
            c.id,
            c.name,
            c.school_year,
            COUNT(DISTINCT s.id)::int AS students_count,
            COUNT(g.id)::int AS grades_count,
            ROUND(AVG(g.grade), 2) AS avg_grade,
            MIN(g.grade) AS min_grade,
            MAX(g.grade) AS max_grade
        FROM classes c
        LEFT JOIN students s ON s.class_id = c.id
        LEFT JOIN grades g ON g.student_id = s.id
        GROUP BY c.id, c.name, c.school_year
        ORDER BY avg_grade DESC NULLS LAST, c.name
    `);

    return result.rows;

};

// Статистика за предметами: кількість учнів, які вивчають предмет (підзапит
// через розклад), середній / мінімальний / максимальний бал
const getSubjectStats = async () => {

    const result = await pool.query(`
        SELECT
            sub.id,
            sub.name,
            CONCAT(tu.first_name, ' ', tu.last_name) AS teacher_name,
            (
                SELECT COUNT(*)
                FROM students st
                WHERE st.class_id IN (
                    SELECT DISTINCT sc.class_id
                    FROM schedule sc
                    WHERE sc.subject_id = sub.id
                )
            )::int AS students_count,
            COUNT(g.id)::int AS grades_count,
            ROUND(AVG(g.grade), 2) AS avg_grade,
            MIN(g.grade) AS min_grade,
            MAX(g.grade) AS max_grade,
            COUNT(g.id) FILTER (WHERE g.grade <= 3)::int AS low_count
        FROM subjects sub
        LEFT JOIN teachers t ON t.id = sub.teacher_id
        LEFT JOIN users tu ON tu.id = t.user_id
        LEFT JOIN grades g ON g.subject_id = sub.id
        GROUP BY sub.id, sub.name, tu.first_name, tu.last_name
        ORDER BY sub.name
    `);

    return result.rows;

};

// Список учнів з незадовільними оцінками (1–3 бали)
const getUnsatisfactory = async () => {

    const result = await pool.query(`
        SELECT
            g.id,
            g.grade,
            g.created_at,
            s.id AS student_id,
            u.first_name,
            u.last_name,
            c.name AS class_name,
            sub.name AS subject_name
        FROM grades g
        JOIN students s ON s.id = g.student_id
        JOIN users u ON u.id = s.user_id
        LEFT JOIN classes c ON c.id = s.class_id
        JOIN subjects sub ON sub.id = g.subject_id
        WHERE g.grade <= 3
        ORDER BY g.created_at DESC
    `);

    return result.rows;

};

// Учні, чий середній бал вищий за середній бал їхнього класу
// (корельований підзапит у HAVING)
const getAboveClassAverage = async () => {

    const result = await pool.query(`
        SELECT
            s.id AS student_id,
            u.first_name,
            u.last_name,
            c.name AS class_name,
            ROUND(AVG(g.grade), 2) AS avg_grade,
            (
                SELECT ROUND(AVG(g2.grade), 2)
                FROM grades g2
                JOIN students s2 ON s2.id = g2.student_id
                WHERE s2.class_id = s.class_id
            ) AS class_avg
        FROM students s
        JOIN users u ON u.id = s.user_id
        JOIN classes c ON c.id = s.class_id
        JOIN grades g ON g.student_id = s.id
        GROUP BY s.id, u.first_name, u.last_name, c.name, s.class_id
        HAVING AVG(g.grade) > (
            SELECT AVG(g2.grade)
            FROM grades g2
            JOIN students s2 ON s2.id = g2.student_id
            WHERE s2.class_id = s.class_id
        )
        ORDER BY c.name, avg_grade DESC
    `);

    return result.rows;

};

// Успішність з окремого предмета: розподіл за рівнями в кожному класі
const getSubjectPerformance = async (subjectId) => {

    const result = await pool.query(`
        SELECT
            c.id AS class_id,
            c.name AS class_name,
            COUNT(g.id)::int AS grades_count,
            ROUND(AVG(g.grade), 2) AS avg_grade,
            COUNT(g.id) FILTER (WHERE g.grade BETWEEN 10 AND 12)::int AS high,
            COUNT(g.id) FILTER (WHERE g.grade BETWEEN 7 AND 9)::int AS sufficient,
            COUNT(g.id) FILTER (WHERE g.grade BETWEEN 4 AND 6)::int AS middle,
            COUNT(g.id) FILTER (WHERE g.grade BETWEEN 1 AND 3)::int AS initial
        FROM grades g
        JOIN students s ON s.id = g.student_id
        JOIN classes c ON c.id = s.class_id
        WHERE g.subject_id = $1
        GROUP BY c.id, c.name
        ORDER BY c.name
    `, [subjectId]);

    return result.rows;

};

// Відвідуваність за класами за період
const getAttendanceByClass = async (from = null, to = null) => {

    const result = await pool.query(`
        SELECT
            c.id,
            c.name,
            COUNT(a.id)::int AS records,
            COUNT(a.id) FILTER (WHERE a.status = 'present')::int AS present,
            COUNT(a.id) FILTER (WHERE a.status = 'late')::int AS late,
            COUNT(a.id) FILTER (WHERE a.status = 'absent')::int AS absent,
            ROUND(
                100.0 * COUNT(a.id) FILTER (WHERE a.status <> 'absent')
                / NULLIF(COUNT(a.id), 0), 1
            ) AS attendance_pct
        FROM classes c
        LEFT JOIN students s ON s.class_id = c.id
        LEFT JOIN attendance a
            ON a.student_id = s.id
           AND ($1::date IS NULL OR a.lesson_date >= $1::date)
           AND ($2::date IS NULL OR a.lesson_date <= $2::date)
        GROUP BY c.id, c.name
        ORDER BY c.name
    `, [from, to]);

    return result.rows;

};

module.exports = {
    getSummary,
    getStudentAverages,
    getClassAverages,
    getSubjectStats,
    getUnsatisfactory,
    getAboveClassAverage,
    getSubjectPerformance,
    getAttendanceByClass
};
