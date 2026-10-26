const multer = require("multer");
const path = require("path");
const fs = require("fs");

/*
 * Налаштування завантаження файлів.
 * Ім'я файлу генерується на сервері (оригінальна назва не використовується),
 * перевіряються тип і розмір файлу.
 */
const makeUploader = ({ folder, allowed, allowedLabel, maxSizeMb }) => {

    const uploadDir = path.join(__dirname, "..", "uploads", folder);

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => cb(null, uploadDir),
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase();
            cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
        }
    });

    const fileFilter = (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error(`Дозволені файли: ${allowedLabel}`));
        }
    };

    return multer({
        storage,
        fileFilter,
        limits: { fileSize: maxSizeMb * 1024 * 1024 }
    });

};

const photoUpload = makeUploader({
    folder: "photos",
    allowed: [".jpg", ".jpeg", ".png", ".webp"],
    allowedLabel: "зображення JPG, PNG, WEBP",
    maxSizeMb: 5
});

const homeworkUpload = makeUploader({
    folder: "homework",
    allowed: [".pdf", ".doc", ".docx", ".txt", ".jpg", ".jpeg", ".png", ".zip", ".pptx", ".xlsx"],
    allowedLabel: "PDF, DOC, DOCX, TXT, JPG, PNG, ZIP, PPTX, XLSX",
    maxSizeMb: 10
});

// Для сумісності: require("../config/multer") повертає завантажувач фото
module.exports = photoUpload;
module.exports.photoUpload = photoUpload;
module.exports.homeworkUpload = homeworkUpload;
