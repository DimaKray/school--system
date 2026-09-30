const scheduleModel = require("../models/scheduleModel");

const getAllSchedule = async () => {

    return await scheduleModel.getAllSchedule();

};

const createSchedule = async (schedule) => {

    return await scheduleModel.createSchedule(
        schedule.class_id,
        schedule.subject_id,
        schedule.teacher_id,
        schedule.weekday,
        schedule.lesson_number,
        schedule.room
    );

};

const updateSchedule = async (
    id,
    schedule
) => {

    return await scheduleModel.updateSchedule(
        id,
        schedule.class_id,
        schedule.subject_id,
        schedule.teacher_id,
        schedule.weekday,
        schedule.lesson_number,
        schedule.room
    );

};

const deleteSchedule = async (id) => {

    return await scheduleModel.deleteSchedule(id);

};

module.exports = {
    getAllSchedule,
    createSchedule,
    updateSchedule,
    deleteSchedule
};