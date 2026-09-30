const studentModel = require("../models/studentModel");

const getAllStudents = async () => {
    return await studentModel.getAllStudents();
};

const createStudent = async (student) => {
    return await studentModel.createStudent(
        student.first_name,
        student.last_name,
        student.email,
        student.password,
        "student",
        student.class_id,
        student.birth_date,
        student.phone,
        student.address,
        student.photo_url
    );
};

const updateStudent = async (id, student) => {

    return await studentModel.updateStudent(
        id,
        student.first_name,
        student.last_name,
        student.email,
        student.class_id,
        student.birth_date,
        student.phone,
        student.address,
        student.photo_url
    );

};

const deleteStudent = async (id) => {
    return await studentModel.deleteStudent(id);
};

module.exports = {
    getAllStudents,
    createStudent,
    updateStudent,
    deleteStudent
};