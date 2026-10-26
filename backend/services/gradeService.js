const { getScope, getTeacherId } = require("../utils/access");
const gradeModel = require("../models/gradeModel");

// Вчитель може виставляти оцінки лише від власного імені
const resolveTeacherId = async (data, user) => {

    if (user && user.role === "teacher") {
        return await getTeacherId(user.id);
    }

    return data.teacher_id;

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

    const teacherId = await resolveTeacherId(grade, user);

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

const deleteGrade = async (id) => {

    return await gradeModel.deleteGrade(id);

};

module.exports = {
    getAllGrades,
    createGrade,
    updateGrade,
    deleteGrade
};