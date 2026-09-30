const attendanceService = require("../services/attendanceService");

const getAllAttendance = async (req, res) => {

    try {

        const attendance = await attendanceService.getAllAttendance();

        res.json({
            success: true,
            attendance
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

const createAttendance = async (req, res) => {

    try {

        const id = await attendanceService.createAttendance(req.body);

        res.status(201).json({
            success: true,
            attendanceId: id
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

const updateAttendance = async (req, res) => {

    try {

        await attendanceService.updateAttendance(
            req.params.id,
            req.body
        );

        res.json({
            success: true,
            message: "Attendance updated"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

const deleteAttendance = async (req, res) => {

    try {

        const deleted = await attendanceService.deleteAttendance(req.params.id);

        if (!deleted) {

            return res.status(404).json({
                success: false,
                message: "Attendance not found"
            });

        }

        res.json({
            success: true,
            message: "Attendance deleted"
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
    getAllAttendance,
    createAttendance,
    updateAttendance,
    deleteAttendance
};