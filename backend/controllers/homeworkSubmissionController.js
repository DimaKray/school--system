const { sendError } = require("../utils/sendError");
const homeworkSubmissionService = require("../services/homeworkSubmissionService");

const getAllHomeworkSubmissions = async (req, res) => {

    try {

        const submissions =
            await homeworkSubmissionService.getAllHomeworkSubmissions(req.user);

        res.json({
            success: true,
            submissions
        });

    } catch (error) {

        sendError(res, error);

    }

};

const createHomeworkSubmission = async (req, res) => {

    try {

        const id =
            await homeworkSubmissionService.createHomeworkSubmission(req.body, req.user);

        res.status(201).json({
            success: true,
            submissionId: id
        });

    } catch (error) {

        sendError(res, error);

    }

};

const updateHomeworkSubmission = async (req, res) => {

    try {

        await homeworkSubmissionService.updateHomeworkSubmission(
            req.params.id,
            req.body,
            req.user
        );

        res.json({
            success: true,
            message: "Homework submission updated"
        });

    } catch (error) {

        sendError(res, error);

    }

};

const deleteHomeworkSubmission = async (req, res) => {

    try {

        const deleted =
            await homeworkSubmissionService.deleteHomeworkSubmission(
                req.params.id,
                req.user
            );

        if (!deleted) {

            return res.status(404).json({
                success: false,
                message: "Homework submission not found"
            });

        }

        res.json({
            success: true,
            message: "Homework submission deleted"
        });

    } catch (error) {

        sendError(res, error);

    }

};

module.exports = {
    getAllHomeworkSubmissions,
    createHomeworkSubmission,
    updateHomeworkSubmission,
    deleteHomeworkSubmission
};