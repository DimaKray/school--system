const pool = require("../config/db");

const getAllHomeworkSubmissions = async () => {

    const result = await pool.query(`
        SELECT
            homework_submissions.id,
            homework_submissions.homework_id,
            homework_submissions.student_id,
            users.first_name,
            users.last_name,
            homework.title,
            homework_submissions.file_url,
            homework_submissions.grade,
            homework_submissions.submitted_at
        FROM homework_submissions
        JOIN students
            ON homework_submissions.student_id = students.id
        JOIN users
            ON students.user_id = users.id
        JOIN homework
            ON homework_submissions.homework_id = homework.id
        ORDER BY homework_submissions.submitted_at DESC
    `);

    return result.rows;

};

const createHomeworkSubmission = async (
    homework_id,
    student_id,
    file_url,
    grade
) => {

    const result = await pool.query(
        `
        INSERT INTO homework_submissions
        (
            homework_id,
            student_id,
            file_url,
            grade
        )
        VALUES ($1,$2,$3,$4)
        RETURNING id
        `,
        [
            homework_id,
            student_id,
            file_url,
            grade
        ]
    );

    return result.rows[0].id;

};

const updateHomeworkSubmission = async (
    id,
    file_url,
    grade
) => {

    await pool.query(
        `
        UPDATE homework_submissions
        SET
            file_url = $1,
            grade = $2
        WHERE id = $3
        `,
        [
            file_url,
            grade,
            id
        ]
    );

    return true;

};

const deleteHomeworkSubmission = async (id) => {

    const result = await pool.query(
        `
        DELETE FROM homework_submissions
        WHERE id = $1
        RETURNING id
        `,
        [id]
    );

    return result.rows.length > 0;

};

module.exports = {
    getAllHomeworkSubmissions,
    createHomeworkSubmission,
    updateHomeworkSubmission,
    deleteHomeworkSubmission
};