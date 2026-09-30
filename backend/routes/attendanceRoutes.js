const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const {
    getAllAttendance,
    createAttendance,
    updateAttendance,
    deleteAttendance
} = require("../controllers/attendanceController");

router.get("/", authMiddleware, getAllAttendance);

router.post("/", authMiddleware, roleMiddleware("admin", "teacher"), createAttendance);

router.put("/:id", authMiddleware, roleMiddleware("admin", "teacher"), updateAttendance);

router.delete("/:id", authMiddleware, roleMiddleware("admin", "teacher"), deleteAttendance);

module.exports = router;