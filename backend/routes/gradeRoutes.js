const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const validate = require("../middlewares/validate");
const v = require("../validators");

const {
    getAllGrades,
    createGrade,
    updateGrade,
    deleteGrade
} = require("../controllers/gradeController");

router.get("/", authMiddleware, getAllGrades);

router.post("/", authMiddleware, roleMiddleware("admin", "teacher"), validate(v.gradeBody), createGrade);

router.put("/:id", authMiddleware, roleMiddleware("admin", "teacher"), validate([...v.routeId, ...v.gradeBody]), updateGrade);

router.delete("/:id", authMiddleware, roleMiddleware("admin", "teacher"), validate(v.routeId), deleteGrade);

module.exports = router;
