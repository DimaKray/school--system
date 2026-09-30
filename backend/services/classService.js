const classModel = require("../models/classModel");

const getAllClasses = async () => {
    return await classModel.getAllClasses();
};

const createClass = async (data) => {

    return await classModel.createClass(
        data.name,
        data.school_year
    );

};

const updateClass = async (id, data) => {

    return await classModel.updateClass(
        id,
        data.name,
        data.school_year
    );

};

const deleteClass = async (id) => {

    return await classModel.deleteClass(id);

};

module.exports = {
    getAllClasses,
    createClass,
    updateClass,
    deleteClass
};