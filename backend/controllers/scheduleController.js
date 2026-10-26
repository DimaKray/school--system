const { sendError } = require("../utils/sendError");
const scheduleService = require("../services/scheduleService");

const getAllSchedule = async (req, res) => {

    try {

        const schedule = await scheduleService.getAllSchedule(req.user);

        res.json({
            success: true,
            schedule
        });

    } catch (error) {

        sendError(res, error);

    }

};

const createSchedule = async (req, res) => {

    try {

        const id = await scheduleService.createSchedule(req.body);

        res.status(201).json({
            success: true,
            scheduleId: id
        });

    } catch (error) {

        sendError(res, error);

    }

};

const updateSchedule = async (req, res) => {

    try {

        await scheduleService.updateSchedule(
            req.params.id,
            req.body
        );

        res.json({
            success: true,
            message: "Schedule updated"
        });

    } catch (error) {

        sendError(res, error);

    }

};

const deleteSchedule = async (req, res) => {

    try {

        const deleted = await scheduleService.deleteSchedule(
            req.params.id
        );

        if (!deleted) {

            return res.status(404).json({
                success: false,
                message: "Schedule not found"
            });

        }

        res.json({
            success: true,
            message: "Schedule deleted"
        });

    } catch (error) {

        sendError(res, error);

    }

};

module.exports = {
    getAllSchedule,
    createSchedule,
    updateSchedule,
    deleteSchedule
};