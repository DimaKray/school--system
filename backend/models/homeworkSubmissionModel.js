const pool = require("../config/db");

const getAllHomeworkSubmissions = async (studentIds = null) => {

    const result = await pool.query(`
        SELECT
            homework_submissions.id,
            homework_submissions.homework_id,
            homework_submissions.student_id,
            users.first_name,
            users.last_name,
            homework.title,
            homework_submissions.file_url,
            homework_submissions.comment,
            homework_submissions.grade,
            homework_submissions.submitted_at
        FROM homework_submissions
        JOIN students
            ON homework_submissions.student_id = students.id
        JOIN users
            ON students.user_id = users.id
        JOIN homework
            ON homework_submissions.homework_id = homework.id
        WHERE ($1::int[] IS NULL OR homework_submissions.student_id = ANY($1::int[]))
        ORDER BY homework_submissions.submitted_at DESC
    `, [studentIds]);

    return result.rows;

};

const getHomeworkSubmissionById = async (id) => {

    const result = await pool.query(
        "SELECT * FROM homework_submissions WHERE id = $1",
        [id]
    );

    return result.rows[0] || null;

};

const createHomeworkSubmission = async (
    homework_id,
    student_id,
    file_url,
    comment
) => {

    const result = await pool.query(
        `
        INSERT INTO homework_submissions
        (
            homework_id,
            student_id,
            file_url,
            comment
        )
        VALUES ($1, $2, $3, $4)
        RETURNING id
        `,
        [
            homework_id,
            student_id,
            file_url || null,
            comment || null
        ]
    );

    return result.rows[0].id;

};

const updateHomeworkSubmissionFile = async (id, file_url, comment) => {

    await pool.query(
        `
        UPDATE homework_submissions
        SET
            file_url = COALESCE($1, file_url),
            comment = $2,
            submitted_at = NOW()
        WHERE id = $3
        `,
        [file_url || null, comment || null, id]
    );

    return true;

};

const gradeHomeworkSubmission = async (id, grade) => {

    await pool.query(
        "UPDATE homework_submissions SET grade = $1 WHERE id = $2",
        [grade, id]
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
    getHomeworkSubmissionById,
    updateHomeworkSubmissionFile,
    gradeHomeworkSubmission,
    createHomeworkSubmission,
    deleteHomeworkSubmission
};