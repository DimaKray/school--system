const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const {
    getAllSchedule,
    createSchedule,
    updateSchedule,
    deleteSchedule
} = require("../controllers/scheduleController");

router.get("/", authMiddleware, getAllSchedule);

router.post("/", authMiddleware, roleMiddleware("admin"), createSchedule);

router.put("/:id", authMiddleware, roleMiddleware("admin"), updateSchedule);

router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteSchedule);

module.exports = router;