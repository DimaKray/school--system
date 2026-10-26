const { sendError } = require("../utils/sendError");
const subjectService = require("../services/subjectService");

const getAllSubjects = async (req, res) => {

    try {

        const subjects = await subjectService.getAllSubjects(req.user);

        res.json({
            success: true,
            subjects
        });

    } catch (error) {

        sendError(res, error);

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

        sendError(res, error);

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

        sendError(res, error);

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

        sendError(res, error);

    }

};

module.exports = {
    getAllSubjects,
    createSubject,
    updateSubject,
    deleteSubject
};