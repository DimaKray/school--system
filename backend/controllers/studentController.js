const studentService = require("../services/studentService");

const getAllStudents = async (req, res) => {

    try {

        const students = await studentService.getAllStudents();

        res.status(200).json({
            success: true,
            students
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });

    }

};

const createStudent = async (req, res) => {

    try {

        const id = await studentService.createStudent(req.body);

        res.status(201).json({
            success: true,
            studentId: id
        });

    }  catch (error) {

    console.log("==========================");
    console.log(error);
    console.log(error.message);
    console.log(error.stack);
    console.log("==========================");

    res.status(500).json({
        success: false,
        message: error.message
    });

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

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

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
    getAllStudents,
    createStudent,
    updateStudent,
    deleteStudent
};