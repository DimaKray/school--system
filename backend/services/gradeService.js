const pool = require("../config/db");
const { getScope, assertTeacherSubjects } = require("../utils/access");
const { httpError } = require("../utils/sendError");
const gradeModel = require("../models/gradeModel");

/*
 * Вчитель виставляє оцінки лише від власного імені
 * і лише з предметів, які він викладає (див. utils/access.js).
 * Адміністратор може вказати будь-якого вчителя.
 */
const resolveTeacherId = async (data, user, extraSubjectIds = []) => {

    const teacherId = await assertTeacherSubjects(user, [data.subject_id, ...extraSubjectIds]);

    return user && user.role === "teacher" ? teacherId : data.teacher_id;

};

const findGrade = async (id) => {

    const result = await pool.query(
        "SELECT id, subject_id FROM grades WHERE id = $1",
        [id]
    );

    if (result.rows.length === 0) {
        throw httpError(404, "Оцінку не знайдено");
    }

    return result.rows[0];

};

const getAllGrades = async (user) => {

    const scope = await getScope(user);

    return gradeModel.getAllGrades(scope ? scope.studentIds : null);

};

const createGrade = async (grade, user) => {

    const teacherId = await resolveTeacherId(grade, user);

    return await gradeModel.createGrade(
        grade.student_id,
        grade.subject_id,
        teacherId,
        grade.grade,
        grade.comment,
        grade.created_at
    );

};

const updateGrade = async (id, grade, user) => {

    const existing = await findGrade(id);

    const teacherId = await resolveTeacherId(grade, user, [existing.subject_id]);

    return await gradeModel.updateGrade(
        id,
        grade.student_id,
        grade.subject_id,
        teacherId,
        grade.grade,
        grade.comment,
        grade.created_at
    );

};

const deleteGrade = async (id, user) => {

    const existing = await findGrade(id);

    await assertTeacherSubjects(user, [existing.subject_id]);

    return await gradeModel.deleteGrade(id);

};

module.exports = {
    getAllGrades,
    createGrade,
    updateGrade,
    deleteGrade
};
