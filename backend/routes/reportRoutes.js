const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const validate = require("../middlewares/validate");
const { query } = require("express-validator");
const v = require("../validators");
const report = require("../controllers/reportController");

// Звіти доступні адміністратору та вчителям
router.use(authMiddleware, roleMiddleware("admin", "teacher"));

const dateRange = validate([
    query("from").optional({ values: "falsy" }).isISO8601().withMessage("Некоректна дата «з»"),
    query("to").optional({ values: "falsy" }).isISO8601().withMessage("Некоректна дата «по»")
]);

router.get("/summary", report.summary);
router.get("/students", report.studentAverages);
router.get("/classes", report.classAverages);
router.get("/subjects", report.subjectStats);
router.get("/subjects/:id", validate(v.routeId), report.subjectPerformance);
router.get("/unsatisfactory", report.unsatisfactory);
router.get("/above-average", report.aboveClassAverage);
router.get("/attendance", dateRange, report.attendanceByClass);

module.exports = router;
