const homeworkModel = require("../models/homeworkModel");

const getAllHomework = async () => {

    return await homeworkModel.getAllHomework();

};

const createHomework = async (homework) => {

    return await homeworkModel.createHomework(
        homework.teacher_id,
        homework.class_id,
        homework.subject_id,
        homework.title,
        homework.description,
        homework.deadline
    );

};

const updateHomework = async (id, homework) => {

    return await homeworkModel.updateHomework(
        id,
        homework.teacher_id,
        homework.class_id,
        homework.subject_id,
        homework.title,
        homework.description,
        homework.deadline
    );

};

const deleteHomework = async (id) => {

    return await homeworkModel.deleteHomework(id);

};

module.exports = {
    getAllHomework,
    createHomework,
    updateHomework,
    deleteHomework
};