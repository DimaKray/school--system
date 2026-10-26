const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const validate = require("../middlewares/validate");
const v = require("../validators");

const {
    getAllSchedule,
    createSchedule,
    updateSchedule,
    deleteSchedule
} = require("../controllers/scheduleController");

router.get("/", authMiddleware, getAllSchedule);

router.post("/", authMiddleware, roleMiddleware("admin"), validate(v.scheduleBody), createSchedule);

router.put("/:id", authMiddleware, roleMiddleware("admin"), validate([...v.routeId, ...v.scheduleBody]), updateSchedule);

router.delete("/:id", authMiddleware, roleMiddleware("admin"), validate(v.routeId), deleteSchedule);

module.exports = router;
