const pool = require("../config/db");
const { httpError } = require("./sendError");

/*
 * Визначення області видимості даних залежно від ролі користувача.
 *
 *  admin, teacher — бачать усі записи (scope = null);
 *  student        — лише власні записи;
 *  parent         — лише записи своїх дітей (таблиця parent_students).
 *
 * Повертає { studentIds: number[], classIds: number[] } або null.
 */
const getScope = async (user) => {

    if (!user || user.role === "admin" || user.role === "teacher") {
        return null;
    }

    let result;

    if (user.role === "student") {

        result = await pool.query(
            "SELECT id, class_id FROM students WHERE user_id = $1",
            [user.id]
        );

    } else {

        result = await pool.query(
            `SELECT s.id, s.class_id
             FROM parent_students ps
             JOIN students s ON s.id = ps.student_id
             WHERE ps.parent_user_id = $1`,
            [user.id]
        );

    }

    return {
        studentIds: result.rows.map((r) => r.id),
        classIds: [...new Set(result.rows.map((r) => r.class_id).filter(Boolean))]
    };

};

// id запису в таблиці teachers для користувача-вчителя
const getTeacherId = async (userId) => {

    const result = await pool.query(
        "SELECT id FROM teachers WHERE user_id = $1",
        [userId]
    );

    return result.rows[0]?.id || null;

};

// id запису в таблиці students для користувача-учня
const getStudentId = async (userId) => {

    const result = await pool.query(
        "SELECT id, class_id FROM students WHERE user_id = $1",
        [userId]
    );

    return result.rows[0] || null;

};

/*
 * Перевірка прав вчителя на запис (оцінки, домашні завдання).
 * Вчитель працює лише з предметами, які він веде: закріплені за ним
 * у таблиці subjects або призначені йому в розкладі.
 * Для адміністратора перевірка не виконується.
 *
 *  subjectIds — предмети, яких стосується дія (нове значення і, для
 *               редагування/видалення, предмет наявного запису).
 *
 * Повертає teacher_id вчителя (або null для адміністратора).
 */
const assertTeacherSubjects = async (user, subjectIds) => {

    if (!user || user.role !== "teacher") {
        return null;
    }

    const teacherId = await getTeacherId(user.id);

    if (!teacherId) {
        throw httpError(403, "Профіль вчителя не знайдено — зверніться до адміністратора");
    }

    const ids = [...new Set(subjectIds.filter(Boolean).map(Number))];

    if (ids.length === 0) {
        return teacherId;
    }

    const result = await pool.query(
        `SELECT id FROM subjects WHERE teacher_id = $1 AND id = ANY($2::int[])
         UNION
         SELECT subject_id FROM schedule WHERE teacher_id = $1 AND subject_id = ANY($2::int[])`,
        [teacherId, ids]
    );

    if (result.rows.length < ids.length) {
        throw httpError(403, "Ви можете працювати лише з предметами, які викладаєте");
    }

    return teacherId;

};

module.exports = {
    getScope,
    getTeacherId,
    getStudentId,
    assertTeacherSubjects
};
