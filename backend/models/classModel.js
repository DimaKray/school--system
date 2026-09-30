const pool = require("../config/db");

const getAllClasses = async () => {

    const result = await pool.query(`
        SELECT
            id,
            name,
            school_year
        FROM classes
        ORDER BY name
    `);

    return result.rows;

};

const createClass = async (name, school_year) => {

    const result = await pool.query(
        `
        INSERT INTO classes (name, school_year)
        VALUES ($1, $2)
        RETURNING id
        `,
        [name, school_year]
    );

    return result.rows[0].id;

};

const updateClass = async (id, name, school_year) => {

    await pool.query(
        `
        UPDATE classes
        SET
            name = $1,
            school_year = $2
        WHERE id = $3
        `,
        [
            name,
            school_year,
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