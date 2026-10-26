const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const validate = require("../middlewares/validate");
const v = require("../validators");

const {
    getAllAttendance,
    createAttendance,
    saveAttendanceBulk,
    updateAttendance,
    deleteAttendance
} = require("../controllers/attendanceController");

const staff = roleMiddleware("admin", "teacher");

router.get("/", authMiddleware, getAllAttendance);

router.post("/", authMiddleware, staff, validate(v.attendanceBody), createAttendance);

// Відмітка всього класу за день одним запитом
router.post("/bulk", authMiddleware, staff, validate(v.attendanceBulk), saveAttendanceBulk);

router.put("/:id", authMiddleware, staff, validate([...v.routeId, ...v.attendanceBody]), updateAttendance);

router.delete("/:id", authMiddleware, staff, validate(v.routeId), deleteAttendance);

module.exports = router;
