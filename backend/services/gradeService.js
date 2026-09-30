const gradeModel = require("../models/gradeModel");

const getAllGrades = async () => {

    return await gradeModel.getAllGrades();

};

const createGrade = async (grade) => {

    return await gradeModel.createGrade(
        grade.student_id,
        grade.subject_id,
        grade.teacher_id,
        grade.grade,
        grade.comment,
        grade.created_at
    );

};

const updateGrade = async (id, grade) => {

    return await gradeModel.updateGrade(
        id,
        grade.student_id,
        grade.subject_id,
        grade.teacher_id,
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