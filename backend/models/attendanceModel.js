const pool = require("../config/db");

const getAllAttendance = async (studentIds = null) => {

    const result = await pool.query(`
        SELECT
            attendance.id,
            attendance.lesson_date,
            attendance.status,

            students.id AS student_id,
            students.class_id,
            student_users.first_name AS student_first_name,
            student_users.last_name AS student_last_name,

            classes.name AS class_name
        
        FROM attendance

        JOIN students ON attendance.student_id = students.id
        JOIN users AS student_users ON students.user_id = student_users.id
        LEFT JOIN classes ON students.class_id = classes.id

        WHERE ($1::int[] IS NULL OR attendance.student_id = ANY($1::int[]))

        ORDER BY attendance.lesson_date DESC
    `, [studentIds]);
    return result.rows;
};

const createAttendance = async (student_id, lesson_date, status) => {

    const result = await pool.query(
        `
        INSERT INTO attendance
        (
            student_id,
            lesson_date,
            status
        )
        VALUES
        (
            $1,
            $2,
            $3
        )
        RETURNING id
        `,
        [
            student_id,
            lesson_date,
            status
        ]
    );

    return result.rows[0].id;

};

const updateAttendance = async (id, student_id, lesson_date, status) => {

    await pool.query(
        `
        UPDATE attendance
        SET
            student_id = $1,
            lesson_date = $2,
            status = $3
        WHERE id = $4
        `,
        [
            student_id,
            lesson_date,
            status,
            id
        ]
    );

    return true;

};

const deleteAttendance = async (id) => {

    const result = await pool.query(
        `
        DELETE FROM attendance
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

// Масове збереження відміток за день: INSERT ... ON CONFLICT DO UPDATE
const upsertAttendanceBulk = async (lesson_date, records) => {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        for (const record of records) {

            await client.query(
                `
                INSERT INTO attendance (student_id, lesson_date, status)
                VALUES ($1, $2, $3)
                ON CONFLICT (student_id, lesson_date)
                DO UPDATE SET status = EXCLUDED.status
                `,
                [record.student_id, lesson_date, record.status]
            );

        }

        await client.query("COMMIT");

        return records.length;

    } catch (error) {

        await client.query("ROLLBACK");
        throw error;

    } finally {

        client.release();

    }

};

module.exports = {
    getAllAttendance,
    upsertAttendanceBulk,
    createAttendance,
    updateAttendance,
    deleteAttendance
};
