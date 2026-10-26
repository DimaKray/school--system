const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validate");
const v = require("../validators");

const {
    getAllHomeworkSubmissions,
    createHomeworkSubmission,
    updateHomeworkSubmission,
    deleteHomeworkSubmission
} = require("../controllers/homeworkSubmissionController");

// Права перевіряються в сервісі: учень — лише свої роботи,
// вчитель і адміністратор — оцінювання.
router.get("/", authMiddleware, getAllHomeworkSubmissions);

router.post("/", authMiddleware, validate(v.submissionCreate), createHomeworkSubmission);

router.put("/:id", authMiddleware, validate(v.submissionUpdate), updateHomeworkSubmission);

router.delete("/:id", authMiddleware, validate(v.routeId), deleteHomeworkSubmission);

module.exports = router;
