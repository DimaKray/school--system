const bcrypt = require("bcrypt");
const pool = require("../config/db");

const register = async (req, res) => {

    try {

        const {
            first_name,
            last_name,
            email,
            password,
            role
        } = req.body;

        if (!first_name || !last_name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "Заповніть усі поля"
            });
        }

        const userExists = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Користувач вже існує"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            `INSERT INTO users
            (first_name,last_name,email,password,role)
            VALUES($1,$2,$3,$4,$5)`,
            [
                first_name,
                last_name,
                email,
                hashedPassword,
                role
            ]
        );

        res.status(201).json({
            success: true,
            message: "Користувача створено"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });

    }

};

const jwt = require("jsonwebtoken");

const login = async (req, res) => {

    try {

        const { email, password } = req.body;

        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Неверный email или пароль"
            });
        }

        const user = result.rows[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Неверный email или пароль"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });

    }

};

module.exports = {
    register,
    login
};