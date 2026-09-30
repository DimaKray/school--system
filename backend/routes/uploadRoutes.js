const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../config/multer");

router.post(
    "/photo",
    authMiddleware,
    (req, res) => {

        upload.single("photo")(req, res, (error) => {

            if (error) {

                return res.status(400).json({
                    success: false,
                    message: error.message
                });

            }

            if (!req.file) {

                return res.status(400).json({
                    success: false,
                    message: "Файл не завантажено"
                });

            }

            const url = `/uploads/photos/${req.file.filename}`;

            res.json({
                success: true,
                url
            });

        });

    }
);

module.exports = router;