const pool = require("../config/db");

/*
 * Визначення області видимості даних залежно від ролі користувача.
 *
 *  admin, teacher — бачать усі записи (scope = null);
 *  student        — лише власні записи;
 *  parent         — лише записи своїх дітей (таблиця parent_students).
 *
 * Повертає { studentIds: number[], classIds: number[] } або null.
 */
const getScope = async (user) => {

    if (!user || user.role === "admin" || user.role === "teacher") {
        return null;
    }

    let result;

    if (user.role === "student") {

        result = await pool.query(
            "SELECT id, class_id FROM students WHERE user_id = $1",
            [user.id]
        );

    } else {

        result = await pool.query(
            `SELECT s.id, s.class_id
             FROM parent_students ps
             JOIN students s ON s.id = ps.student_id
             WHERE ps.parent_user_id = $1`,
            [user.id]
        );

    }

    return {
        studentIds: result.rows.map((r) => r.id),
        classIds: [...new Set(result.rows.map((r) => r.class_id).filter(Boolean))]
    };

};

// id запису в таблиці teachers для користувача-вчителя
const getTeacherId = async (userId) => {

    const result = await pool.query(
        "SELECT id FROM teachers WHERE user_id = $1",
        [userId]
    );

    return result.rows[0]?.id || null;

};

// id запису в таблиці students для користувача-учня
const getStudentId = async (userId) => {

    const result = await pool.query(
        "SELECT id, class_id FROM students WHERE user_id = $1",
        [userId]
    );

    return result.rows[0] || null;

};

module.exports = {
    getScope,
    getTeacherId,
    getStudentId
};
