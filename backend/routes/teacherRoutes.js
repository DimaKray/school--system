const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const validate = require("../middlewares/validate");
const v = require("../validators");

const {
    getAllTeachers,
    createTeacher,
    updateTeacher,
    deleteTeacher
} = require("../controllers/teacherController");

router.get("/", authMiddleware, getAllTeachers);

router.post("/", authMiddleware, roleMiddleware("admin"), validate(v.teacherCreate), createTeacher);

router.put("/:id", authMiddleware, roleMiddleware("admin"), validate([...v.routeId, ...v.teacherUpdate]), updateTeacher);

router.delete("/:id", authMiddleware, roleMiddleware("admin"), validate(v.routeId), deleteTeacher);

module.exports = router;
