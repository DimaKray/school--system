const { getScope, getTeacherId } = require("../utils/access");
const homeworkModel = require("../models/homeworkModel");

// Вчитель може задавати завдання лише від власного імені
const resolveTeacherId = async (data, user) => {

    if (user && user.role === "teacher") {
        return await getTeacherId(user.id);
    }

    return data.teacher_id;

};

const getAllHomework = async (user) => {
    const scope = await getScope(user);

    return homeworkModel.getAllHomework(scope ? scope.classIds : null);

};

const createHomework = async (homework, user) => {

    const teacherId = await resolveTeacherId(homework, user);

    return await homeworkModel.createHomework(
        teacherId,
        homework.class_id,
        homework.subject_id,
        homework.title,
        homework.description,
        homework.deadline
    );

};

const updateHomework = async (id, homework, user) => {

    const teacherId = await resolveTeacherId(homework, user);

    return await homeworkModel.updateHomework(
        id,
        teacherId,
        homework.class_id,
        homework.subject_id,
        homework.title,
        homework.description,
        homework.deadline
    );

};

const deleteHomework = async (id) => {

    return await homeworkModel.deleteHomework(id);

};

module.exports = {
    getAllHomework,
    createHomework,
    updateHomework,
    deleteHomework
};