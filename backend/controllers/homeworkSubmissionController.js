const homeworkSubmissionService = require("../services/homeworkSubmissionService");

const getAllHomeworkSubmissions = async (req, res) => {

    try {

        const submissions =
            await homeworkSubmissionService.getAllHomeworkSubmissions();

        res.json({
            success: true,
            submissions
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

const createHomeworkSubmission = async (req, res) => {

    try {

        const id =
            await homeworkSubmissionService.createHomeworkSubmission(req.body);

        res.status(201).json({
            success: true,
            submissionId: id
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

const updateHomeworkSubmission = async (req, res) => {

    try {

        await homeworkSubmissionService.updateHomeworkSubmission(
            req.params.id,
            req.body
        );

        res.json({
            success: true,
            message: "Homework submission updated"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

const deleteHomeworkSubmission = async (req, res) => {

    try {

        const deleted =
            await homeworkSubmissionService.deleteHomeworkSubmission(
                req.params.id
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

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

module.exports = {
    getAllHomeworkSubmissions,
    createHomeworkSubmission,
    updateHomeworkSubmission,
    deleteHomeworkSubmission
};