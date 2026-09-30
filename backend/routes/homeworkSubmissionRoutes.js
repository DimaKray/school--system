const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");

const {
    getAllHomeworkSubmissions,
    createHomeworkSubmission,
    updateHomeworkSubmission,
    deleteHomeworkSubmission
} = require("../controllers/homeworkSubmissionController");

router.get(
    "/",
    authMiddleware,
    getAllHomeworkSubmissions
);

router.post(
    "/",
    authMiddleware,
    createHomeworkSubmission
);

router.put(
    "/:id",
    authMiddleware,
    updateHomeworkSubmission
);

router.delete(
    "/:id",
    authMiddleware,
    deleteHomeworkSubmission
);

module.exports = router;