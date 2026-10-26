const pool = require("../config/db");

const getAllGrades = async (studentIds = null) => {

    const result = await pool.query(`
        SELECT
            grades.id,
            grades.grade,
            grades.comment,
            grades.created_at,

            students.id AS student_id,
            student_users.first_name AS student_first_name,
            student_users.last_name AS student_last_name,

            subjects.id AS subject_id,
            subjects.name AS subject_name,

            teachers.id AS teacher_id,
            teacher_users.first_name AS teacher_first_name,
            teacher_users.last_name AS teacher_last_name

        FROM grades

        JOIN students
            ON grades.student_id = students.id

        JOIN users AS student_users
            ON students.user_id = student_users.id

        JOIN subjects
            ON grades.subject_id = subjects.id

        JOIN teachers
            ON grades.teacher_id = teachers.id

        JOIN users AS teacher_users
            ON teachers.user_id = teacher_users.id

        WHERE ($1::int[] IS NULL OR grades.student_id = ANY($1::int[]))

        ORDER BY grades.created_at DESC
    `, [studentIds]);

    return result.rows;

};

const createGrade = async (
    student_id,
    subject_id,
    teacher_id,
    grade,
    comment,
    created_at
) => {

    const result = await pool.query(
        `
        INSERT INTO grades
        (
            student_id,
            subject_id,
            teacher_id,
            grade,
            comment,
            created_at
        )
        VALUES
        (
            $1,
            $2,
            $3,
            $4,
            $5,
            COALESCE($6::TIMESTAMP, NOW())
        )
        RETURNING id
        `,
        [
            student_id,
            subject_id,
            teacher_id,
            grade,
            comment,
            created_at || null
        ]
    );

    return result.rows[0].id;

};

const updateGrade = async (
    id,
    student_id,
    subject_id,
    teacher_id,
    grade,
    comment,
    created_at
) => {

    await pool.query(
        `
        UPDATE grades
        SET
            student_id = $1,
            subject_id = $2,
            teacher_id = $3,
            grade = $4,
            comment = $5,
            created_at = COALESCE($6::TIMESTAMP, created_at)
        WHERE id = $7
        `,
        [
            student_id,
            subject_id,
            teacher_id,
            grade,
            comment,
            created_at || null,
            id
        ]
    );

    return true;

};

const deleteGrade = async (id) => {

    const result = await pool.query(
        `
        DELETE FROM grades
        WHERE id = $1
        RETURNING id
        `,
        [id]
    );

    if (result.rows.length === 0) {
        return false;
    }

    return true;

};

module.exports = {
    getAllGrades,
    createGrade,
    updateGrade,
    deleteGrade
};