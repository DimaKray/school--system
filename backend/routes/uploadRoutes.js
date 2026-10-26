const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const { photoUpload, homeworkUpload } = require("../config/multer");

// Обробник завантаження одного файлу: повертає URL збереженого файлу
const uploadSingle = (uploader, field, folder) => (req, res) => {

    uploader.single(field)(req, res, (error) => {

        if (error) {
            const message = error.code === "LIMIT_FILE_SIZE"
                ? "Файл завеликий"
                : error.message;
            return res.status(400).json({ success: false, message });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: "Файл не завантажено" });
        }

        res.json({
            success: true,
            url: `/uploads/${folder}/${req.file.filename}`
        });

    });

};

// Фото користувачів завантажує адміністратор
router.post("/photo", authMiddleware, roleMiddleware("admin"), uploadSingle(photoUpload, "photo", "photos"));

// Файл виконаного домашнього завдання завантажує учень
router.post("/homework", authMiddleware, roleMiddleware("student"), uploadSingle(homeworkUpload, "file", "homework"));

module.exports = router;
