const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const controller = require("../controllers/studentController");

console.log(controller);

const {
    getAllStudents,
    createStudent,
    updateStudent,
    deleteStudent
} = require("../controllers/studentController");

router.get("/", authMiddleware, getAllStudents);

router.post("/", authMiddleware, roleMiddleware("admin"), createStudent);

router.put("/:id", authMiddleware, roleMiddleware("admin"), updateStudent);

router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteStudent);

module.exports = router;