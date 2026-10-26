const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const validate = require("../middlewares/validate");
const v = require("../validators");

const {
    getAllSubjects,
    createSubject,
    updateSubject,
    deleteSubject
} = require("../controllers/subjectController");

router.get("/", authMiddleware, getAllSubjects);

router.post("/", authMiddleware, roleMiddleware("admin"), validate(v.subjectBody), createSubject);

router.put("/:id", authMiddleware, roleMiddleware("admin"), validate([...v.routeId, ...v.subjectBody]), updateSubject);

router.delete("/:id", authMiddleware, roleMiddleware("admin"), validate(v.routeId), deleteSubject);

module.exports = router;
