const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const {
    getAllSubjects,
    createSubject,
    updateSubject,
    deleteSubject
} = require("../controllers/subjectController");

router.get("/", authMiddleware, getAllSubjects);

router.post("/", authMiddleware, roleMiddleware("admin"), createSubject);

router.put("/:id", authMiddleware, roleMiddleware("admin"), updateSubject);

router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteSubject);

module.exports = router;