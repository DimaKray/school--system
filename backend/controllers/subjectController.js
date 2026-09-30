const subjectService = require("../services/subjectService");

const getAllSubjects = async (req, res) => {

    try {

        const subjects = await subjectService.getAllSubjects();

        res.json({
            success: true,
            subjects
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

const createSubject = async (req, res) => {

    try {

        const id = await subjectService.createSubject(req.body);

        res.status(201).json({
            success: true,
            subjectId: id
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

const updateSubject = async (req, res) => {

    try {

        await subjectService.updateSubject(
            req.params.id,
            req.body
        );

        res.json({
            success: true,
            message: "Subject updated"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

const deleteSubject = async (req, res) => {

    try {

        const deleted = await subjectService.deleteSubject(
            req.params.id
        );

        if (!deleted) {

            return res.status(404).json({
                success: false,
                message: "Subject not found"
            });

        }

        res.json({
            success: true,
            message: "Subject deleted"
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
    getAllSubjects,
    createSubject,
    updateSubject,
    deleteSubject
};