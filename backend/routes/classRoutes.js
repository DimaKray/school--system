const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const {
    getAllClasses,
    createClass,
    updateClass,
    deleteClass
} = require("../controllers/classController");

router.get("/", authMiddleware, getAllClasses);

router.post("/", authMiddleware, roleMiddleware("admin"), createClass);

router.put("/:id", authMiddleware, roleMiddleware("admin"), updateClass);

router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteClass);

module.exports = router;