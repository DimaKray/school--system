const { body, param } = require("express-validator");

/*
 * Правила перевірки вхідних даних для REST API.
 * Перевірка на сервері обов'язкова навіть за наявності перевірки у формах,
 * бо запит можна надіслати в обхід інтерфейсу.
 */

const id = (field) => body(field)
    .isInt({ min: 1 }).withMessage(`Поле ${field} має бути додатним цілим числом`)
    .toInt();

const optionalId = (field) => body(field)
    .optional({ values: "falsy" })
    .isInt({ min: 1 }).withMessage(`Поле ${field} має бути додатним цілим числом`)
    .toInt();

const name = (field, label) => body(field)
    .trim()
    .notEmpty().withMessage(`Вкажіть ${label}`)
    .isLength({ max: 100 }).withMessage(`${label}: не більше 100 символів`);

const email = body("email")
    .trim()
    .isEmail().withMessage("Некоректний email");

const password = body("password")
    .isLength({ min: 6 }).withMessage("Пароль має містити щонайменше 6 символів");

const optionalDate = (field) => body(field)
    .optional({ values: "falsy" })
    .isISO8601().withMessage(`Некоректна дата в полі ${field}`);

const phone = body("phone")
    .optional({ values: "falsy" })
    .matches(/^[+\d\s()-]{7,20}$/).withMessage("Некоректний номер телефону");

const routeId = param("id").isInt({ min: 1 }).withMessage("Некоректний ідентифікатор");

module.exports = {

    routeId: [routeId],

    register: [
        name("first_name", "ім'я"),
        name("last_name", "прізвище"),
        email,
        password,
        body("role")
            .isIn(["teacher", "student", "parent"])
            .withMessage("Самостійна реєстрація доступна лише для ролей: вчитель, учень, батьки")
    ],

    login: [
        body("email").trim().isEmail().withMessage("Некоректний email"),
        body("password").notEmpty().withMessage("Вкажіть пароль")
    ],

    studentCreate: [
        name("first_name", "ім'я"), name("last_name", "прізвище"), email, password,
        optionalId("class_id"), optionalDate("birth_date"), phone
    ],

    studentUpdate: [
        name("first_name", "ім'я"), name("last_name", "прізвище"), email,
        optionalId("class_id"), optionalDate("birth_date"), phone
    ],

    teacherCreate: [
        name("first_name", "ім'я"), name("last_name", "прізвище"), email, password, phone
    ],

    teacherUpdate: [
        name("first_name", "ім'я"), name("last_name", "прізвище"), email, phone
    ],

    classBody: [
        body("name").trim().notEmpty().withMessage("Вкажіть назву класу")
            .isLength({ max: 20 }).withMessage("Назва класу: не більше 20 символів"),
        body("school_year").trim()
            .matches(/^\d{4}\/\d{4}$/).withMessage("Навчальний рік у форматі 2025/2026"),
        optionalId("teacher_id")
    ],

    subjectBody: [
        name("name", "назву предмета"),
        optionalId("teacher_id"),
        body("description").optional({ values: "null" }).isLength({ max: 1000 })
            .withMessage("Опис: не більше 1000 символів")
    ],

    scheduleBody: [
        id("class_id"), id("subject_id"), id("teacher_id"),
        body("weekday").isInt({ min: 1, max: 7 }).withMessage("День тижня — від 1 до 7").toInt(),
        body("lesson_number").isInt({ min: 1, max: 12 }).withMessage("Номер уроку — від 1 до 12").toInt(),
        body("room").optional({ values: "falsy" }).isLength({ max: 20 }).withMessage("Кабінет: не більше 20 символів")
    ],

    gradeBody: [
        id("student_id"), id("subject_id"), optionalId("teacher_id"),
        body("grade").isInt({ min: 1, max: 12 }).withMessage("Оцінка має бути від 1 до 12").toInt(),
        body("comment").optional({ values: "null" }).isLength({ max: 500 }).withMessage("Коментар: не більше 500 символів"),
        optionalDate("created_at")
    ],

    attendanceBody: [
        id("student_id"),
        body("lesson_date").isISO8601().withMessage("Некоректна дата уроку"),
        body("status").isIn(["present", "absent", "late"]).withMessage("Статус: present, absent або late")
    ],

    attendanceBulk: [
        body("lesson_date").isISO8601().withMessage("Некоректна дата уроку"),
        body("records").isArray({ min: 1 }).withMessage("Передайте список відміток"),
        body("records.*.student_id").isInt({ min: 1 }).withMessage("Некоректний учень").toInt(),
        body("records.*.status").isIn(["present", "absent", "late"]).withMessage("Статус: present, absent або late")
    ],

    homeworkBody: [
        id("class_id"), id("subject_id"), optionalId("teacher_id"),
        body("title").trim().notEmpty().withMessage("Вкажіть назву завдання")
            .isLength({ max: 255 }).withMessage("Назва: не більше 255 символів"),
        optionalDate("deadline")
    ],

    submissionCreate: [
        id("homework_id"),
        body("file_url").optional({ values: "falsy" }).isString(),
        body("comment").optional({ values: "null" }).isLength({ max: 1000 }).withMessage("Коментар: не більше 1000 символів")
    ],

    submissionUpdate: [
        routeId,
        body("grade").optional({ values: "null" }).isInt({ min: 1, max: 12 })
            .withMessage("Оцінка має бути від 1 до 12").toInt()
    ],

    parentChild: [
        param("parentId").isInt({ min: 1 }).withMessage("Некоректний ідентифікатор батьків"),
        id("student_id")
    ]

};
