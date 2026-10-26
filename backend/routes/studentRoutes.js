const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const validate = require("../middlewares/validate");
const v = require("../validators");

const {
    getAllStudents,
    createStudent,
    updateStudent,
    deleteStudent
} = require("../controllers/studentController");

router.get("/", authMiddleware, getAllStudents);

router.post("/", authMiddleware, roleMiddleware("admin"), validate(v.studentCreate), createStudent);

router.put("/:id", authMiddleware, roleMiddleware("admin"), validate([...v.routeId, ...v.studentUpdate]), updateStudent);

router.delete("/:id", authMiddleware, roleMiddleware("admin"), validate(v.routeId), deleteStudent);

module.exports = router;
