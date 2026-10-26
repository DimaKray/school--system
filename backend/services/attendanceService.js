const { getScope } = require("../utils/access");
const attendanceModel = require("../models/attendanceModel");

const getAllAttendance = async (user) => {
    const scope = await getScope(user);

    return attendanceModel.getAllAttendance(scope ? scope.studentIds : null);
};

const createAttendance = async (attendanceData) => {
    
    return await attendanceModel.createAttendance(
        attendanceData.student_id,
        attendanceData.lesson_date,
        attendanceData.status
    );
};
const updateAttendance = async (id, attendance) => {

    return await attendanceModel.updateAttendance(
        id,
        attendance.student_id,
        attendance.lesson_date,
        attendance.status
    );

};

const deleteAttendance = async (id) => {

    return await attendanceModel.deleteAttendance(id);

};

// Масова відмітка відвідуваності класу за день (UPSERT)
const saveAttendanceBulk = async (lesson_date, records) => {

    return await attendanceModel.upsertAttendanceBulk(lesson_date, records);

};

module.exports = {
    getAllAttendance,
    saveAttendanceBulk,
    createAttendance,
    updateAttendance,
    deleteAttendance
};