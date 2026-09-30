const subjectModel = require("../models/subjectModel");

const getAllSubjects = async () => {

    return await subjectModel.getAllSubjects();

};

const createSubject = async (subject) => {

    return await subjectModel.createSubject(
        subject.name,
        subject.teacher_id,
        subject.description
    );

};

const updateSubject = async (
    id,
    subject
) => {

    return await subjectModel.updateSubject(
        id,
        subject.name,
        subject.teacher_id,
        subject.description
    );

};

const deleteSubject = async (id) => {

    return await subjectModel.deleteSubject(id);

};

module.exports = {
    getAllSubjects,
    createSubject,
    updateSubject,
    deleteSubject
};