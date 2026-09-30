const attendanceModel = require("../models/attendanceModel");

const getAllAttendance = async () => {

    return await attendanceModel.getAllAttendance();
};

const createAttendance = async (attendanceData) => {
    
    return await addendanceModel.createAttendance(
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

module.exports = {
    getAllAttendance,
    createAttendance,
    updateAttendance,
    deleteAttendance
};