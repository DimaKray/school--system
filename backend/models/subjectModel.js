const pool = require("../config/db");

const getAllSubjects = async () => {

    const result = await pool.query(`
        SELECT
            subjects.id,
            subjects.name,
            subjects.description,
            subjects.teacher_id,
            users.first_name,
            users.last_name
        FROM subjects
        LEFT JOIN teachers
            ON subjects.teacher_id = teachers.id
        LEFT JOIN users
            ON teachers.user_id = users.id
        ORDER BY subjects.name
    `);

    return result.rows;

};

const createSubject = async (
    name,
    teacher_id,
    description
) => {

    const result = await pool.query(
        `
        INSERT INTO subjects
        (name, teacher_id, description)
        VALUES ($1, $2, $3)
        RETURNING id
        `,
        [
            name,
            teacher_id,
            description || null
        ]
    );

    return result.rows[0].id;

};

const updateSubject = async (
    id,
    name,
    teacher_id,
    description
) => {

    await pool.query(
        `
        UPDATE subjects
        SET
            name = $1,
            teacher_id = $2,
            description = $3
        WHERE id = $4
        `,
        [
            name,
            teacher_id,
            description || null,
            id
        ]
    );

    return true;

};

const deleteSubject = async (id) => {

    const result = await pool.query(
        `
        DELETE FROM subjects
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
    getAllSubjects,
    createSubject,
    updateSubject,
    deleteSubject
};