const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const {
    getAllGrades,
    createGrade,
    updateGrade,
    deleteGrade
} = require("../controllers/gradeController");

router.get("/", authMiddleware, getAllGrades);

router.post("/", authMiddleware, roleMiddleware("admin", "teacher"), createGrade);

router.put("/:id", authMiddleware, roleMiddleware("admin", "teacher"), updateGrade );

router.delete("/:id", authMiddleware, roleMiddleware("admin", "teacher"), deleteGrade);

module.exports = router;