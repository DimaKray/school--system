const { sendError } = require("../utils/sendError");
const attendanceService = require("../services/attendanceService");

const getAllAttendance = async (req, res) => {

    try {

        const attendance = await attendanceService.getAllAttendance(req.user);

        res.json({
            success: true,
            attendance
        });

    } catch (error) {

        sendError(res, error);

    }

};

const createAttendance = async (req, res) => {

    try {

        const id = await attendanceService.createAttendance(req.body, req.user);

        res.status(201).json({
            success: true,
            attendanceId: id
        });

    } catch (error) {

        sendError(res, error);

    }

};

const saveAttendanceBulk = async (req, res) => {

    try {

        const count = await attendanceService.saveAttendanceBulk(
            req.body.lesson_date,
            req.body.records
        );

        res.json({
            success: true,
            saved: count
        });

    } catch (error) {

        sendError(res, error);

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

        sendError(res, error);

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

        sendError(res, error);

    }

};

module.exports = {
    getAllAttendance,
    saveAttendanceBulk,
    createAttendance,
    updateAttendance,
    deleteAttendance
};