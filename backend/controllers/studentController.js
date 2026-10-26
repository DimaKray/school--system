const { sendError } = require("../utils/sendError");
const studentService = require("../services/studentService");

const getAllStudents = async (req, res) => {

    try {

        const students = await studentService.getAllStudents(req.user);

        res.status(200).json({
            success: true,
            students
        });

    } catch (error) {

        sendError(res, error);

    }

};

const createStudent = async (req, res) => {

    try {

        const id = await studentService.createStudent(req.body);

        res.status(201).json({
            success: true,
            studentId: id
        });

    } catch (error) {

        sendError(res, error);

    }

};

const updateStudent = async (req, res) => {

    try {

        await studentService.updateStudent(
            req.params.id,
            req.body
        );

        res.json({
            success: true,
            message: "Student updated"
        });

    } catch (error) {

        sendError(res, error);

    }

};

const deleteStudent = async (req, res) => {

    try {

        const deleted = await studentService.deleteStudent(req.params.id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        res.json({
            success: true,
            message: "Student deleted"
        });

    } catch (error) {

        sendError(res, error);

    }

};

module.exports = {
    getAllStudents,
    createStudent,
    updateStudent,
    deleteStudent
};