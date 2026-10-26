/*
 * Єдина обробка помилок у контролерах.
 * Помилки PostgreSQL перетворюються на зрозумілі повідомлення,
 * а технічні деталі не передаються клієнту.
 */
const PG_ERRORS = {
    "23505": [409, "Такий запис уже існує"],
    "23503": [400, "Пов'язаний запис не знайдено або він використовується в інших даних"],
    "23514": [400, "Дані не відповідають обмеженням бази даних"],
    "23502": [400, "Не заповнено обов'язкове поле"],
    "22P02": [400, "Некоректний формат даних"],
    "22007": [400, "Некоректний формат дати"],
    "22008": [400, "Некоректна дата"]
};

const sendError = (res, error) => {

    console.error(error);

    if (error.status) {
        return res.status(error.status).json({
            success: false,
            message: error.message
        });
    }

    const known = PG_ERRORS[error.code];

    if (known) {
        return res.status(known[0]).json({
            success: false,
            message: known[1]
        });
    }

    return res.status(500).json({
        success: false,
        message: "Внутрішня помилка сервера"
    });

};

// Помилка з HTTP-статусом, яку можна кинути із сервісу
const httpError = (status, message) => {
    const error = new Error(message);
    error.status = status;
    return error;
};

module.exports = { sendError, httpError };
