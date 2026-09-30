const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const {
    getAllHomework,
    createHomework,
    updateHomework,
    deleteHomework
} = require("../controllers/homeworkController");

router.get("/", authMiddleware, getAllHomework);

router.post("/", authMiddleware, roleMiddleware("admin", "teacher"), createHomework);

router.put("/:id", authMiddleware, roleMiddleware("admin", "teacher"), updateHomework);

router.delete("/:id", authMiddleware, roleMiddleware("admin", "teacher"), deleteHomework);

module.exports = router;