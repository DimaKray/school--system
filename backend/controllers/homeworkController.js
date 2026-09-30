const homeworkService = require("../services/homeworkService");

const getAllHomework = async (req, res) => {

    try {

        const homework = await homeworkService.getAllHomework();

        res.json({
            success: true,
            homework
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

const createHomework = async (req, res) => {

    try {

        const id = await homeworkService.createHomework(req.body);

        res.status(201).json({
            success: true,
            homeworkId: id
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

const updateHomework = async (req, res) => {

    try {

        await homeworkService.updateHomework(
            req.params.id,
            req.body
        );

        res.json({
            success: true,
            message: "Homework updated"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

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

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

module.exports = {
    getAllHomework,
    createHomework,
    updateHomework,
    deleteHomework
};