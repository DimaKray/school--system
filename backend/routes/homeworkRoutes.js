const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const validate = require("../middlewares/validate");
const v = require("../validators");

const {
    getAllHomework,
    createHomework,
    updateHomework,
    deleteHomework
} = require("../controllers/homeworkController");

router.get("/", authMiddleware, getAllHomework);

router.post("/", authMiddleware, roleMiddleware("admin", "teacher"), validate(v.homeworkBody), createHomework);

router.put("/:id", authMiddleware, roleMiddleware("admin", "teacher"), validate([...v.routeId, ...v.homeworkBody]), updateHomework);

router.delete("/:id", authMiddleware, roleMiddleware("admin", "teacher"), validate(v.routeId), deleteHomework);

module.exports = router;
