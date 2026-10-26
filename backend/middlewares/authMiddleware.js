const jwt = require("jsonwebtoken");

/*
 * Перевірка JWT-токена з заголовка Authorization: Bearer <token>.
 * Після успішної перевірки в req.user потрапляють { id, role }.
 */
const authMiddleware = (req, res, next) => {

    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({
            success: false,
            message: "Потрібна авторизація"
        });
    }

    try {

        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();

    } catch (error) {

        return res.status(401).json({
            success: false,
            message: error.name === "TokenExpiredError"
                ? "Сесія завершилась, увійдіть знову"
                : "Недійсний токен"
        });

    }

};

module.exports = authMiddleware;
