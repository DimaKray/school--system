const express = require("express");

const router = express.Router();

const {
    register,
    login
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);

module.exports = router;

const authMiddleware = require("../middlewares/authMiddleware");

router.get("/profile", authMiddleware, (req, res) => {

    res.json({
        success: true,
        user: req.user
    });

});