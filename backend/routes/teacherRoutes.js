const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const {
    getAllTeachers,
    createTeacher,
    updateTeacher,
    deleteTeacher
} = require("../controllers/teacherController");

router.get("/", authMiddleware, getAllTeachers);

router.post("/", authMiddleware, roleMiddleware("admin"), createTeacher);

router.put("/:id", authMiddleware, roleMiddleware("admin"), updateTeacher);

router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteTeacher);

module.exports = router;