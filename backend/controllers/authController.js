const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const { sendError } = require("../utils/sendError");

/*
 * Самостійна реєстрація. Роль «admin» тут заборонена (див. validators/index.js):
 * облікові записи адміністраторів створюються лише вручну або через seed.
 */
const register = async (req, res) => {

    try {

        const { first_name, last_name, email, password, role } = req.body;

        const userExists = await pool.query(
            "SELECT id FROM users WHERE LOWER(email) = LOWER($1)",
            [email]
        );

        if (userExists.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Користувач з таким email уже існує"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            `INSERT INTO users (first_name, last_name, email, password, role)
             VALUES ($1, $2, $3, $4, $5)`,
            [first_name, last_name, email, hashedPassword, role]
        );

        res.status(201).json({
            success: true,
            message: "Користувача створено"
        });

    } catch (error) {

        sendError(res, error);

    }

};

const login = async (req, res) => {

    try {

        const { email, password } = req.body;

        const result = await pool.query(
            "SELECT * FROM users WHERE LOWER(email) = LOWER($1)",
            [email]
        );

        const user = result.rows[0];

        // Однакове повідомлення для неіснуючого email і хибного пароля,
        // щоб не підказувати, які облікові записи існують.
        const isMatch = user ? await bcrypt.compare(password, user.password) : false;

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Невірний email або пароль"
            });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role,
                photo_url: user.photo_url
            }
        });

    } catch (error) {

        sendError(res, error);

    }

};

// Особистий кабінет: дані користувача та пов'язані з ним записи
const profile = async (req, res) => {

    try {

        const result = await pool.query(
            `SELECT id, first_name, last_name, email, role, photo_url, created_at
             FROM users WHERE id = $1`,
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Користувача не знайдено" });
        }

        const user = result.rows[0];
        let details = null;

        if (user.role === "student") {

            const r = await pool.query(
                `SELECT s.id AS student_id, s.birth_date, s.phone, s.address, c.name AS class_name
                 FROM students s LEFT JOIN classes c ON c.id = s.class_id
                 WHERE s.user_id = $1`,
                [user.id]
            );
            details = r.rows[0] || null;

        } else if (user.role === "teacher") {

            const r = await pool.query(
                `SELECT t.id AS teacher_id, t.phone, t.specialization,
                        COALESCE(json_agg(s.name ORDER BY s.name) FILTER (WHERE s.id IS NOT NULL), '[]') AS subjects
                 FROM teachers t LEFT JOIN subjects s ON s.teacher_id = t.id
                 WHERE t.user_id = $1
                 GROUP BY t.id`,
                [user.id]
            );
            details = r.rows[0] || null;

        } else if (user.role === "parent") {

            const r = await pool.query(
                `SELECT s.id AS student_id, u.first_name, u.last_name, c.name AS class_name
                 FROM parent_students ps
                 JOIN students s ON s.id = ps.student_id
                 JOIN users u ON u.id = s.user_id
                 LEFT JOIN classes c ON c.id = s.class_id
                 WHERE ps.parent_user_id = $1
                 ORDER BY u.last_name`,
                [user.id]
            );
            details = { children: r.rows };

        }

        res.json({ success: true, user, details });

    } catch (error) {

        sendError(res, error);

    }

};

module.exports = {
    register,
    login,
    profile
};
