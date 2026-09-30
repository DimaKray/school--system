import { useEffect, useState, Fragment } from "react";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";

import {
    getSchedule,
    createSchedule,
    updateSchedule,
    deleteSchedule
} from "../../services/scheduleService";
import { getClasses } from "../../services/classService";
import { getSubjects } from "../../services/subjectService";
import { getTeachers } from "../../services/teacherService";

import { getSubjectColor } from "../../utils/subjectColors";
import { getLessonTime } from "../../utils/lessonTimes";
import { getCurrentWeekDays, getWeekRangeLabel } from "../../utils/weekDates";

import "./Schedule.css";

const LESSON_NUMBERS = [1, 2, 3, 4, 5, 6];

const emptyForm = {
    class_id: "",
    subject_id: "",
    teacher_id: "",
    weekday: "1",
    lesson_number: "1",
    room: ""
};

function Schedule() {

    const [schedule, setSchedule] = useState([]);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [classFilter, setClassFilter] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const weekDays = getCurrentWeekDays();
    const weekRangeLabel = getWeekRangeLabel(weekDays);

    const loadData = async () => {

        setLoading(true);

        try {

            const [
                scheduleRes,
                classesRes,
                subjectsRes,
                teachersRes
            ] = await Promise.all([
                getSchedule(),
                getClasses(),
                getSubjects(),
                getTeachers()
            ]);

            setSchedule(scheduleRes.data.schedule || []);
            setClasses(classesRes.data.classes || []);
            setSubjects(subjectsRes.data.subjects || []);
            setTeachers(teachersRes.data.teachers || []);

        } catch (error) {

            console.error(error);
            toast.error("Не вдалося завантажити розклад");

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {
        loadData();
    }, []);

    const openCreate = (weekday, lessonNumber) => {

        setEditingId(null);

        setForm({
            ...emptyForm,
            class_id: classFilter || "",
            weekday: String(weekday),
            lesson_number: String(lessonNumber)
        });

        setShowModal(true);

    };

    const openEdit = (item) => {

        setEditingId(item.id);

        setForm({
            class_id: item.class_id || "",
            subject_id: item.subject_id || "",
            teacher_id: item.teacher_id || "",
            weekday: String(item.weekday || 1),
            lesson_number: String(item.lesson_number || 1),
            room: item.room || ""
        });

        setShowModal(true);

    };

    const closeModal = () => {
        setShowModal(false);
        setEditingId(null);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!form.class_id || !form.subject_id || !form.teacher_id) {
            toast.error("Заповніть усі обов'язкові поля");
            return;
        }

        setSaving(true);

        try {

            const payload = {
                class_id: Number(form.class_id),
                subject_id: Number(form.subject_id),
                teacher_id: Number(form.teacher_id),
                weekday: Number(form.weekday),
                lesson_number: Number(form.lesson_number),
                room: form.room
            };

            if (editingId) {

                await updateSchedule(editingId, payload);
                toast.success("Урок оновлено");

            } else {

                await createSchedule(payload);
                toast.success("Урок додано до розкладу");

            }

            closeModal();
            loadData();

        } catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.message || "Не вдалося зберегти урок"
            );

        } finally {

            setSaving(false);

        }

    };

    const handleDelete = async () => {

        if (!editingId) {
            return;
        }

        if (!window.confirm("Видалити цей урок з розкладу?")) {
            return;
        }

        try {

            await deleteSchedule(editingId);
            toast.success("Урок видалено");
            closeModal();
            loadData();

        } catch (error) {

            console.error(error);
            toast.error("Не вдалося видалити урок");

        }

    };

    const filteredSchedule = classFilter
        ? schedule.filter((s) => String(s.class_id) === String(classFilter))
        : schedule;

    const findLesson = (weekday, lessonNumber) =>
        filteredSchedule.find(
            (s) => s.weekday === weekday && s.lesson_number === lessonNumber
        );

    return (
        <div className="sch-page">

            <div className="sch-header">

                <div>
                    <h1>Розклад</h1>
                </div>

                <div className="sch-header-controls">

                    <select
                        className="sch-select"
                        value={classFilter}
                        onChange={(e) => setClassFilter(e.target.value)}
                    >
                        <option value="">Усі класи</option>
                        {classes.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>

                    <div className="sch-week-badge">
                        {weekRangeLabel}
                    </div>

                </div>

            </div>

            {loading ? (

                <div className="sch-loading">Завантаження...</div>

            ) : (

                <div className="sch-grid-card">

                    <div
                        className="sch-grid"
                        style={{
                            gridTemplateColumns: `90px repeat(${weekDays.length}, 1fr)`
                        }}
                    >

                        <div className="sch-corner" />

                        {weekDays.map((day) => (
                            <div key={day.weekday} className="sch-day-head">
                                <div className="sch-day-name">{day.label}</div>
                                <div className="sch-day-date">{day.dateLabel}</div>
                            </div>
                        ))}

                        {LESSON_NUMBERS.map((lessonNumber) => (
                            <Fragment key={lessonNumber}>
                                <div key={`time-${lessonNumber}`} className="sch-time-cell">
                                    <div className="sch-lesson-num">{lessonNumber}</div>
                                    <div className="sch-lesson-time">
                                        {getLessonTime(lessonNumber)}
                                    </div>
                                </div>

                                {weekDays.map((day) => {

                                    const lesson = findLesson(day.weekday, lessonNumber);
                                    const color = lesson
                                        ? getSubjectColor(lesson.subject_id)
                                        : null;

                                    return (
                                        <div
                                            key={`${day.weekday}-${lessonNumber}`}
                                            className="sch-cell"
                                        >
                                            {lesson ? (
                                                <button
                                                    type="button"
                                                    className="sch-lesson-block"
                                                    style={{
                                                        background: color.bg,
                                                        color: color.text
                                                    }}
                                                    onClick={() => openEdit(lesson)}
                                                >
                                                    <div className="sch-lesson-subject">
                                                        {lesson.subject_name}
                                                    </div>
                                                    <div className="sch-lesson-class">
                                                        {lesson.class_name}
                                                    </div>
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="sch-empty-cell"
                                                    onClick={() => openCreate(day.weekday, lessonNumber)}
                                                >
                                                    +
                                                </button>
                                            )}
                                        </div>
                                    );

                                })}
                            </Fragment>
                        ))}

                    </div>

                </div>

            )}

            {showModal && (
                <div className="dp-modal-backdrop" onClick={closeModal}>

                    <div
                        className="dp-modal"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <h2>
                            {editingId ? "Редагувати урок" : "Новий урок"}
                        </h2>

                        <form onSubmit={handleSubmit}>

                            <div className="dp-form-group">
                                <label>Клас</label>
                                <select
                                    name="class_id"
                                    value={form.class_id}
                                    onChange={handleChange}
                                >
                                    <option value="">Оберіть клас</option>
                                    {classes.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="dp-form-group">
                                <label>Предмет</label>
                                <select
                                    name="subject_id"
                                    value={form.subject_id}
                                    onChange={handleChange}
                                >
                                    <option value="">Оберіть предмет</option>
                                    {subjects.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="dp-form-group">
                                <label>Вчитель</label>
                                <select
                                    name="teacher_id"
                                    value={form.teacher_id}
                                    onChange={handleChange}
                                >
                                    <option value="">Оберіть вчителя</option>
                                    {teachers.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.first_name} {t.last_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="dp-form-grid">

                                <div className="dp-form-group">
                                    <label>День тижня</label>
                                    <select
                                        name="weekday"
                                        value={form.weekday}
                                        onChange={handleChange}
                                    >
                                        {weekDays.map((d) => (
                                            <option key={d.weekday} value={d.weekday}>
                                                {d.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="dp-form-group">
                                    <label>№ уроку</label>
                                    <select
                                        name="lesson_number"
                                        value={form.lesson_number}
                                        onChange={handleChange}
                                    >
                                        {LESSON_NUMBERS.map((n) => (
                                            <option key={n} value={n}>
                                                {n} ({getLessonTime(n)})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                            </div>

                            <div className="dp-form-group">
                                <label>Кабінет</label>
                                <input
                                    name="room"
                                    value={form.room}
                                    onChange={handleChange}
                                    placeholder="напр. 204"
                                />
                            </div>

                            <div className="dp-modal-actions">

                                {editingId && (
                                    <button
                                        type="button"
                                        className="dp-btn dp-btn-danger"
                                        onClick={handleDelete}
                                        style={{ marginRight: "auto" }}
                                    >
                                        Видалити
                                    </button>
                                )}

                                <button
                                    type="button"
                                    className="dp-btn dp-btn-secondary"
                                    onClick={closeModal}
                                >
                                    <FaTimes /> Скасувати
                                </button>

                                <button
                                    type="submit"
                                    className="dp-btn dp-btn-primary"
                                    disabled={saving}
                                >
                                    {saving ? "Збереження..." : "Зберегти"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
}

export default Schedule;