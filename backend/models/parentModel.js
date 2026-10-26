const pool = require("../config/db");

// Усі користувачі з роллю «батьки» та їхні діти (json_agg)
const getAllParents = async () => {

    const result = await pool.query(`
        SELECT
            u.id,
            u.first_name,
            u.last_name,
            u.email,
            COALESCE(
                json_agg(
                    json_build_object(
                        'student_id', s.id,
                        'first_name', su.first_name,
                        'last_name', su.last_name,
                        'class_name', c.name
                    ) ORDER BY su.last_name
                ) FILTER (WHERE s.id IS NOT NULL),
                '[]'
            ) AS children
        FROM users u
        LEFT JOIN parent_students ps ON ps.parent_user_id = u.id
        LEFT JOIN students s ON s.id = ps.student_id
        LEFT JOIN users su ON su.id = s.user_id
        LEFT JOIN classes c ON c.id = s.class_id
        WHERE u.role = 'parent'
        GROUP BY u.id
        ORDER BY u.last_name, u.first_name
    `);

    return result.rows;

};

const isParent = async (userId) => {

    const result = await pool.query(
        "SELECT 1 FROM users WHERE id = $1 AND role = 'parent'",
        [userId]
    );

    return result.rows.length > 0;

};

const addChild = async (parentUserId, studentId) => {

    await pool.query(
        `INSERT INTO parent_students (parent_user_id, student_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [parentUserId, studentId]
    );

};

const removeChild = async (parentUserId, studentId) => {

    const result = await pool.query(
        `DELETE FROM parent_students
         WHERE parent_user_id = $1 AND student_id = $2
         RETURNING student_id`,
        [parentUserId, studentId]
    );

    return result.rows.length > 0;

};

module.exports = {
    getAllParents,
    isParent,
    addChild,
    removeChild
};
