const homeworkSubmissionModel = require("../models/homeworkSubmissionModel");

const getAllHomeworkSubmissions = () => {
    return homeworkSubmissionModel.getAllHomeworkSubmissions();
};

const createHomeworkSubmission = (data) => {

    return homeworkSubmissionModel.createHomeworkSubmission(
        data.homework_id,
        data.student_id,
        data.file_url,
        data.grade
    );

};

const updateHomeworkSubmission = (id, data) => {

    return homeworkSubmissionModel.updateHomeworkSubmission(
        id,
        data.file_url,
        data.grade
    );

};

const deleteHomeworkSubmission = (id) => {
    return homeworkSubmissionModel.deleteHomeworkSubmission(id);
};

module.exports = {
    getAllHomeworkSubmissions,
    createHomeworkSubmission,
    updateHomeworkSubmission,
    deleteHomeworkSubmission
};