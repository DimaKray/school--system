const pool = require("../config/db");

const getAllClasses = async () => {

    const result = await pool.query(`
        SELECT
            classes.id,
            classes.name,
            classes.school_year,
            classes.teacher_id,
            users.first_name AS teacher_first_name,
            users.last_name AS teacher_last_name
        FROM classes
        LEFT JOIN teachers ON classes.teacher_id = teachers.id
        LEFT JOIN users ON teachers.user_id = users.id
        ORDER BY classes.name
    `);

    return result.rows;

};

const createClass = async (name, school_year, teacher_id) => {

    const result = await pool.query(
        `
        INSERT INTO classes (name, school_year, teacher_id)
        VALUES ($1, $2, $3)
        RETURNING id
        `,
        [name, school_year, teacher_id || null]
    );

    return result.rows[0].id;

};

const updateClass = async (id, name, school_year, teacher_id) => {

    await pool.query(
        `
        UPDATE classes
        SET
            name = $1,
            school_year = $2,
            teacher_id = $3
        WHERE id = $4
        `,
        [
            name,
            school_year,
            teacher_id || null,
            id
        ]
    );

    return true;

};

const deleteClass = async (id) => {

    const result = await pool.query(
        "DELETE FROM classes WHERE id = $1 RETURNING id",
        [id]
    );

    if (result.rows.length === 0) {
        return false;
    }

    return true;

};

module.exports = {
    getAllClasses,
    createClass,
    updateClass,
    deleteClass
};