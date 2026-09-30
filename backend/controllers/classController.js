const classService = require("../services/classService");

const getAllClasses = async (req, res) => {

    try {

        const classes = await classService.getAllClasses();

        res.json({
            success: true,
            classes
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

const createClass = async (req, res) => {

    try {

        const id = await classService.createClass(req.body);

        res.status(201).json({
            success: true,
            classId: id
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

const updateClass = async (req, res) => {

    try {

        await classService.updateClass(
            req.params.id,
            req.body
        );

        res.json({
            success: true,
            message: "Class updated"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

const deleteClass = async (req, res) => {

    try {

        const deleted = await classService.deleteClass(req.params.id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Class not found"
            });
        }

        res.json({
            success: true,
            message: "Class deleted"
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
    getAllClasses,
    createClass,
    updateClass,
    deleteClass
};