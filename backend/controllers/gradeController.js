const { sendError } = require("../utils/sendError");
const gradeService = require("../services/gradeService");

const getAllGrades = async (req, res) => {

    try {

        const grades = await gradeService.getAllGrades(req.user);

        res.json({
            success: true,
            grades
        });

    } catch (error) {

        sendError(res, error);

    }

};

const createGrade = async (req, res) => {

    try {

        const id = await gradeService.createGrade(req.body, req.user);

        res.status(201).json({
            success: true,
            gradeId: id
        });

    } catch (error) {

        sendError(res, error);

    }

};

const updateGrade = async (req, res) => {

    try {

        await gradeService.updateGrade(
            req.params.id,
            req.body,
            req.user
        );

        res.json({
            success: true,
            message: "Grade updated"
        });

    } catch (error) {

        sendError(res, error);

    }

};

const deleteGrade = async (req, res) => {

    try {

        const deleted = await gradeService.deleteGrade(req.params.id);

        if (!deleted) {

            return res.status(404).json({
                success: false,
                message: "Grade not found"
            });

        }

        res.json({
            success: true,
            message: "Grade deleted"
        });

    } catch (error) {

        sendError(res, error);

    }

};

module.exports = {
    getAllGrades,
    createGrade,
    updateGrade,
    deleteGrade
};