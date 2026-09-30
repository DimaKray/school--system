const gradeService = require("../services/gradeService");

const getAllGrades = async (req, res) => {

    try {

        const grades = await gradeService.getAllGrades();

        res.json({
            success: true,
            grades
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

const createGrade = async (req, res) => {

    try {

        const id = await gradeService.createGrade(req.body);

        res.status(201).json({
            success: true,
            gradeId: id
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

const updateGrade = async (req, res) => {

    try {

        await gradeService.updateGrade(
            req.params.id,
            req.body
        );

        res.json({
            success: true,
            message: "Grade updated"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

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

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

module.exports = {
    getAllGrades,
    createGrade,
    updateGrade,
    deleteGrade
};