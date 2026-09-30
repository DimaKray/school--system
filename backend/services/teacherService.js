const teacherModel = require("../models/teacherModel");

const getAllTeachers = async () => {

    return await teacherModel.getAllTeachers();

};

const createTeacher = async (teacher) => {

    return await teacherModel.createTeacher(
        teacher.first_name,
        teacher.last_name,
        teacher.email,
        teacher.password,
        "teacher",
        teacher.specialization,
        teacher.phone,
        teacher.photo_url
    );

};

const updateTeacher = async (id, teacher) => {

    return await teacherModel.updateTeacher(
        id,
        teacher.first_name,
        teacher.last_name,
        teacher.email,
        teacher.subject,
        teacher.phone,
        teacher.photo_url
    );

};

const deleteTeacher = async (id) => {

    return await teacherModel.deleteTeacher(id);

};

module.exports = {
    getAllTeachers,
    createTeacher,
    updateTeacher,
    deleteTeacher
};