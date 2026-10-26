const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const validate = require("../middlewares/validate");
const { param } = require("express-validator");
const v = require("../validators");
const parent = require("../controllers/parentController");

// Керування зв'язками «батьки — дитина» — лише адміністратор
router.use(authMiddleware, roleMiddleware("admin"));

router.get("/", parent.getAllParents);

router.post("/:parentId/children", validate(v.parentChild), parent.addChild);

router.delete(
    "/:parentId/children/:studentId",
    validate([
        param("parentId").isInt({ min: 1 }).withMessage("Некоректний ідентифікатор"),
        param("studentId").isInt({ min: 1 }).withMessage("Некоректний ідентифікатор")
    ]),
    parent.removeChild
);

module.exports = router;
