const parentModel = require("../models/parentModel");
const { sendError } = require("../utils/sendError");

const getAllParents = async (req, res) => {

    try {

        const parents = await parentModel.getAllParents();
        res.json({ success: true, parents });

    } catch (error) {

        sendError(res, error);

    }

};

const addChild = async (req, res) => {

    try {

        const parentId = Number(req.params.parentId);

        if (!(await parentModel.isParent(parentId))) {
            return res.status(404).json({
                success: false,
                message: "Користувача з роллю «Батьки» не знайдено"
            });
        }

        await parentModel.addChild(parentId, req.body.student_id);

        res.status(201).json({ success: true, message: "Дитину прив'язано" });

    } catch (error) {

        sendError(res, error);

    }

};

const removeChild = async (req, res) => {

    try {

        const removed = await parentModel.removeChild(
            Number(req.params.parentId),
            Number(req.params.studentId)
        );

        if (!removed) {
            return res.status(404).json({ success: false, message: "Зв'язок не знайдено" });
        }

        res.json({ success: true, message: "Зв'язок видалено" });

    } catch (error) {

        sendError(res, error);

    }

};

module.exports = {
    getAllParents,
    addChild,
    removeChild
};
