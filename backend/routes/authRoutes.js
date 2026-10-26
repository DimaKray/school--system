const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validate");
const v = require("../validators");

const {
    register,
    login,
    profile
} = require("../controllers/authController");

router.post("/register", validate(v.register), register);

router.post("/login", validate(v.login), login);

router.get("/profile", authMiddleware, profile);

module.exports = router;
