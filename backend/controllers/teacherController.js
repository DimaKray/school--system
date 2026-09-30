const teacherService = require("../services/teacherService");

const getAllTeachers = async (req, res) => {

    try {

        const teachers = await teacherService.getAllTeachers();

        res.json({
            success: true,
            teachers
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

const createTeacher = async (req, res) => {

    try {

        const id = await teacherService.createTeacher(req.body);

        res.status(201).json({
            success: true,
            teacherId: id
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

const updateTeacher = async (req, res) => {

    try {

        await teacherService.updateTeacher(
            req.params.id,
            req.body
        );

        res.json({
            success: true,
            message: "Teacher updated"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

const deleteTeacher = async (req, res) => {

    try {

        const deleted = await teacherService.deleteTeacher(req.params.id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Teacher not found"
            });
        }

        res.json({
            success: true,
            message: "Teacher deleted"
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
    getAllTeachers,
    createTeacher,
    updateTeacher,
    deleteTeacher
};