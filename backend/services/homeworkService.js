const pool = require("../config/db");
const { getScope, assertTeacherSubjects } = require("../utils/access");
const { httpError } = require("../utils/sendError");
const homeworkModel = require("../models/homeworkModel");

/*
 * Вчитель задає завдання лише від власного імені
 * і лише з предметів, які він викладає (див. utils/access.js).
 * Адміністратор може вказати будь-якого вчителя.
 */
const resolveTeacherId = async (data, user, extraSubjectIds = []) => {

    const teacherId = await assertTeacherSubjects(user, [data.subject_id, ...extraSubjectIds]);

    return user && user.role === "teacher" ? teacherId : data.teacher_id;

};

const findHomework = async (id) => {

    const result = await pool.query(
        "SELECT id, subject_id FROM homework WHERE id = $1",
        [id]
    );

    if (result.rows.length === 0) {
        throw httpError(404, "Завдання не знайдено");
    }

    return result.rows[0];

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

    const existing = await findHomework(id);

    const teacherId = await resolveTeacherId(homework, user, [existing.subject_id]);

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

const deleteHomework = async (id, user) => {

    const existing = await findHomework(id);

    await assertTeacherSubjects(user, [existing.subject_id]);

    return await homeworkModel.deleteHomework(id);

};

module.exports = {
    getAllHomework,
    createHomework,
    updateHomework,
    deleteHomework
};
