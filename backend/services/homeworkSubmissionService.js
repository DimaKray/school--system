const { getScope, getStudentId } = require("../utils/access");
const { httpError } = require("../utils/sendError");
const pool = require("../config/db");
const homeworkSubmissionModel = require("../models/homeworkSubmissionModel");

const getAllHomeworkSubmissions = async (user) => {
    const scope = await getScope(user);
    return homeworkSubmissionModel.getAllHomeworkSubmissions(scope ? scope.studentIds : null);
};

/*
 * Здати роботу може лише учень і лише для завдання свого класу.
 * student_id береться з токена, а не з тіла запиту.
 */
const createHomeworkSubmission = async (data, user) => {

    if (user.role !== "student") {
        throw httpError(403, "Здавати роботи можуть лише учні");
    }

    const student = await getStudentId(user.id);

    if (!student) {
        throw httpError(400, "Профіль учня не знайдено");
    }

    const hw = await pool.query(
        "SELECT class_id FROM homework WHERE id = $1",
        [data.homework_id]
    );

    if (hw.rows.length === 0) {
        throw httpError(404, "Завдання не знайдено");
    }

    if (hw.rows[0].class_id !== student.class_id) {
        throw httpError(403, "Це завдання не для вашого класу");
    }

    return homeworkSubmissionModel.createHomeworkSubmission(
        data.homework_id,
        student.id,
        data.file_url,
        data.comment
    );

};

/*
 * Учень може змінити файл/коментар своєї ще не оціненої роботи;
 * вчитель і адміністратор — лише виставити оцінку.
 */
const updateHomeworkSubmission = async (id, data, user) => {

    const existing = await homeworkSubmissionModel.getHomeworkSubmissionById(id);

    if (!existing) {
        throw httpError(404, "Роботу не знайдено");
    }

    if (user.role === "teacher" || user.role === "admin") {
        return homeworkSubmissionModel.gradeHomeworkSubmission(id, data.grade);
    }

    if (user.role === "student") {

        const student = await getStudentId(user.id);

        if (!student || student.id !== existing.student_id) {
            throw httpError(403, "Можна змінювати лише власну роботу");
        }

        if (existing.grade !== null) {
            throw httpError(400, "Роботу вже оцінено — змінити її не можна");
        }

        return homeworkSubmissionModel.updateHomeworkSubmissionFile(
            id,
            data.file_url,
            data.comment
        );

    }

    throw httpError(403, "Недостатньо прав для цієї дії");

};

const deleteHomeworkSubmission = async (id, user) => {

    if (user.role === "student") {

        const existing = await homeworkSubmissionModel.getHomeworkSubmissionById(id);
        const student = await getStudentId(user.id);

        if (!existing || !student || existing.student_id !== student.id) {
            throw httpError(403, "Можна видалити лише власну роботу");
        }

        if (existing.grade !== null) {
            throw httpError(400, "Роботу вже оцінено — видалити її не можна");
        }

    } else if (user.role !== "teacher" && user.role !== "admin") {

        throw httpError(403, "Недостатньо прав для цієї дії");

    }

    return homeworkSubmissionModel.deleteHomeworkSubmission(id);

};

module.exports = {
    getAllHomeworkSubmissions,
    createHomeworkSubmission,
    updateHomeworkSubmission,
    deleteHomeworkSubmission
};
