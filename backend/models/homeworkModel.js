const pool = require("../config/db");

const getAllHomework = async () => {

    const result = await pool.query(`
        SELECT
            homework.id,
            homework.title,
            homework.description,
            homework.deadline,
            homework.created_at,
            homework.teacher_id,
            homework.class_id,
            homework.subject_id,

            classes.name AS class_name,
            subjects.name AS subject_name,
            users.first_name,
            users.last_name

        FROM homework

        JOIN classes
            ON homework.class_id = classes.id

        JOIN subjects
            ON homework.subject_id = subjects.id

        JOIN teachers
            ON homework.teacher_id = teachers.id

        JOIN users
            ON teachers.user_id = users.id

        ORDER BY homework.deadline
    `);

    return result.rows;

};

const createHomework = async (
    teacher_id,
    class_id,
    subject_id,
    title,
    description,
    deadline
) => {

    const result = await pool.query(
        `
        INSERT INTO homework
        (
            teacher_id,
            class_id,
            subject_id,
            title,
            description,
            deadline
        )
        VALUES ($1,$2,$3,$4,$5,$6)
        RETURNING id
        `,
        [
            teacher_id,
            class_id,
            subject_id,
            title,
            description,
            deadline
        ]
    );

    return result.rows[0].id;

};

const updateHomework = async (
    id,
    teacher_id,
    class_id,
    subject_id,
    title,
    description,
    deadline
) => {

    await pool.query(
        `
        UPDATE homework
        SET
            teacher_id = $1,
            class_id = $2,
            subject_id = $3,
            title = $4,
            description = $5,
            deadline = $6
        WHERE id = $7
        `,
        [
            teacher_id,
            class_id,
            subject_id,
            title,
            description,
            deadline,
            id
        ]
    );

    return true;

};

const deleteHomework = async (id) => {

    const result = await pool.query(
        "DELETE FROM homework WHERE id = $1",
        [id]
    );

    return result.rowCount > 0;

};

module.exports = {
    getAllHomework,
    createHomework,
    updateHomework,
    deleteHomework
};