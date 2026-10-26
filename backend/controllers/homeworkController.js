const { sendError } = require("../utils/sendError");
const homeworkService = require("../services/homeworkService");

const getAllHomework = async (req, res) => {

    try {

        const homework = await homeworkService.getAllHomework(req.user);

        res.json({
            success: true,
            homework
        });

    } catch (error) {

        sendError(res, error);

    }

};

const createHomework = async (req, res) => {

    try {

        const id = await homeworkService.createHomework(req.body, req.user);

        res.status(201).json({
            success: true,
            homeworkId: id
        });

    } catch (error) {

        sendError(res, error);

    }

};

const updateHomework = async (req, res) => {

    try {

        await homeworkService.updateHomework(
            req.params.id,
            req.body,
            req.user
        );

        res.json({
            success: true,
            message: "Homework updated"
        });

    } catch (error) {

        sendError(res, error);

    }

};

const deleteHomework = async (req, res) => {

    try {

        const deleted = await homeworkService.deleteHomework(req.params.id);

        if (!deleted) {

            return res.status(404).json({
                success: false,
                message: "Homework not found"
            });

        }

        res.json({
            success: true,
            message: "Homework deleted"
        });

    } catch (error) {

        sendError(res, error);

    }

};

module.exports = {
    getAllHomework,
    createHomework,
    updateHomework,
    deleteHomework
};