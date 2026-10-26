const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const validate = require("../middlewares/validate");
const v = require("../validators");

const {
    getAllClasses,
    createClass,
    updateClass,
    deleteClass
} = require("../controllers/classController");

router.get("/", authMiddleware, getAllClasses);

router.post("/", authMiddleware, roleMiddleware("admin"), validate(v.classBody), createClass);

router.put("/:id", authMiddleware, roleMiddleware("admin"), validate([...v.routeId, ...v.classBody]), updateClass);

router.delete("/:id", authMiddleware, roleMiddleware("admin"), validate(v.routeId), deleteClass);

module.exports = router;
