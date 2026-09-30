const pool = require("../config/db");

const getAllSchedule = async () => {

    const result = await pool.query(`
        SELECT
            schedule.id,
            schedule.class_id,
            schedule.subject_id,
            schedule.teacher_id,
            schedule.weekday,
            schedule.lesson_number,
            schedule.room,

            classes.name AS class_name,

            subjects.name AS subject_name,

            users.first_name,
            users.last_name

        FROM schedule

        JOIN classes
            ON schedule.class_id = classes.id

        JOIN subjects
            ON schedule.subject_id = subjects.id

        JOIN teachers
            ON schedule.teacher_id = teachers.id

        JOIN users
            ON teachers.user_id = users.id

        ORDER BY
            schedule.weekday,
            schedule.lesson_number
    `);

    return result.rows;

};

const createSchedule = async (
    class_id,
    subject_id,
    teacher_id,
    weekday,
    lesson_number,
    room
) => {

    const result = await pool.query(
        `
        INSERT INTO schedule
        (
            class_id,
            subject_id,
            teacher_id,
            weekday,
            lesson_number,
            room
        )
        VALUES
        (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6
        )
        RETURNING id
        `,
        [
            class_id,
            subject_id,
            teacher_id,
            weekday,
            lesson_number,
            room
        ]
    );

    return result.rows[0].id;

};

const updateSchedule = async (
    id,
    class_id,
    subject_id,
    teacher_id,
    weekday,
    lesson_number,
    room
) => {

    await pool.query(
        `
        UPDATE schedule
        SET
            class_id = $1,
            subject_id = $2,
            teacher_id = $3,
            weekday = $4,
            lesson_number = $5,
            room = $6
        WHERE id = $7
        `,
        [
            class_id,
            subject_id,
            teacher_id,
            weekday,
            lesson_number,
            room,
            id
        ]
    );

    return true;

};

const deleteSchedule = async (id) => {

    const result = await pool.query(
        `
        DELETE FROM schedule
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
    getAllSchedule,
    createSchedule,
    updateSchedule,
    deleteSchedule
};