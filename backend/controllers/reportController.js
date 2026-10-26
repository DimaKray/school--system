const reportModel = require("../models/reportModel");
const { sendError } = require("../utils/sendError");

const toIntOrNull = (value) => {
    const n = Number(value);
    return Number.isInteger(n) && n > 0 ? n : null;
};

// Обгортка: виконує запит звіту і повертає { success, data }
const handle = (fn) => async (req, res) => {

    try {

        const data = await fn(req);
        res.json({ success: true, data });

    } catch (error) {

        sendError(res, error);

    }

};

module.exports = {
    summary: handle(() => reportModel.getSummary()),
    studentAverages: handle((req) =>
        reportModel.getStudentAverages(toIntOrNull(req.query.class_id), toIntOrNull(req.query.subject_id))),
    classAverages: handle(() => reportModel.getClassAverages()),
    subjectStats: handle(() => reportModel.getSubjectStats()),
    unsatisfactory: handle(() => reportModel.getUnsatisfactory()),
    aboveClassAverage: handle(() => reportModel.getAboveClassAverage()),
    subjectPerformance: handle((req) => reportModel.getSubjectPerformance(toIntOrNull(req.params.id))),
    attendanceByClass: handle((req) =>
        reportModel.getAttendanceByClass(req.query.from || null, req.query.to || null))
};
