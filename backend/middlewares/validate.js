const { validationResult } = require("express-validator");

/*
 * Перевіряє результат правил express-validator.
 * Якщо дані некоректні — повертає 400 з переліком помилок
 * і не допускає запит до контролера та бази даних.
 */
const validate = (rules) => [

    ...rules,

    (req, res, next) => {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: errors.array()[0].msg,
                errors: errors.array().map((e) => ({ field: e.path, message: e.msg }))
            });
        }

        next();

    }

];

module.exports = validate;
