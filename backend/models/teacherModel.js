const pool = require("../config/db");
const bcrypt = require("bcrypt");

const getAllTeachers = async () => {

    const result = await pool.query(`
        SELECT
            teachers.id,
            users.first_name,
            users.last_name,
            users.email,
            users.photo_url,
            teachers.specialization AS subject,
            teachers.phone
        FROM teachers
        JOIN users
            ON teachers.user_id = users.id
        ORDER BY users.last_name
    `);

    return result.rows;

};

const createTeacher = async (
    first_name,
    last_name,
    email,
    password,
    role,
    subject,
    phone,
    photo_url
) => {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        const hashedPassword = await bcrypt.hash(password, 10);

        const userResult = await client.query(
        `
        INSERT INTO users
        (first_name, last_name, email, password, role, photo_url)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
        `,
        [first_name, last_name, email, hashedPassword, role, photo_url || null]
    );

        const userId = userResult.rows[0].id;

        const teacherResult = await client.query(
            `
            INSERT INTO teachers
            (user_id, specialization, phone)
            VALUES ($1, $2, $3)
            RETURNING id
            `,
            [userId, subject, phone]
        );

        await client.query("COMMIT");

        return teacherResult.rows[0].id;

    } catch (error) {

        await client.query("ROLLBACK");
        throw error;

    } finally {

        client.release();

    }

};

const updateTeacher = async (
    id,
    first_name,
    last_name,
    email,
    specialization,
    phone,
    photo_url
) => {

    await pool.query(
        `
        UPDATE users
        SET
            first_name = $1,
            last_name = $2,
            email = $3,
            photo_url = COALESCE($4, photo_url)
        WHERE id = (
            SELECT user_id
            FROM teachers
            WHERE id = $5
        )
        `,
        [first_name, last_name, email, photo_url || null, id]
    );

    await pool.query(
        `
        UPDATE teachers
        SET
            specialization = $1,
            phone = $2
        WHERE id = $3
        `,
        [
            specialization,
            phone,
            id
        ]
    );

    return true;

};

const deleteTeacher = async (id) => {

    const result = await pool.query(
        `
        SELECT user_id
        FROM teachers
        WHERE id = $1
        `,
        [id]
    );

    if (result.rows.length === 0) {
        return false;
    }

    const userId = result.rows[0].user_id;

    await pool.query(
        `
        DELETE FROM teachers
        WHERE id = $1
        `,
        [id]
    );

    await pool.query(
        `
        DELETE FROM users
        WHERE id = $1
        `,
        [userId]
    );

    return true;

};

module.exports = {
    getAllTeachers,
    createTeacher,
    updateTeacher,
    deleteTeacher
};