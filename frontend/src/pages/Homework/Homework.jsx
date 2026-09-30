import { useEffect, useMemo, useState } from "react";
import { FaPlus, FaTimes, FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import dayjs from "dayjs";

import {
    getHomework,
    createHomework,
    updateHomework,
    deleteHomework
} from "../../services/homeworkService";
import { getHomeworkSubmissions } from "../../services/homeworkSubmissionService";
import { getClasses } from "../../services/classService";
import { getSubjects } from "../../services/subjectService";
import { getTeachers } from "../../services/teacherService";
import { getStudents } from "../../services/studentService";

import { getSubjectStyle } from "../../utils/subjectStyle";

import "../../styles/DataPage.css";
import "./Homework.css";

const TABS = [
    { id: "all", label: "Всі завдання" },
    { id: "active", label: "Активні" },
    { id: "assigned", label: "Задані" },
    { id: "overdue", label: "Просрочені" }
];

const emptyForm = {
    teacher_id: "",
    class_id: "",
    subject_id: "",
    title: "",
    description: "",
    deadline: ""
};

function Homework() {

    const [homework, setHomework] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState("all");

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const loadData = async () => {

        setLoading(true);

        try {

            const [
                homeworkRes,
                submissionsRes,
                classesRes,
                subjectsRes,
                teachersRes,
                studentsRes
            ] = await Promise.all([
                getHomework(),
                getHomeworkSubmissions(),
                getClasses(),
                getSubjects(),
                getTeachers(),
                getStudents()
            ]);

            setHomework(homeworkRes.data.homework || []);
            setSubmissions(submissionsRes.data.submissions || []);
            setClasses(classesRes.data.classes || []);
            setSubjects(subjectsRes.data.subjects || []);
            setTeachers(teachersRes.data.teachers || []);
            setStudents(studentsRes.data.students || []);

        } catch (error) {

            console.error(error);
            toast.error("Не вдалося завантажити домашні завдання");

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {
        loadData();
    }, []);

    const getStats = (hw) => {

        const submitted = submissions.filter(
            (s) => String(s.homework_id) === String(hw.id)
        ).length;

        const total = students.filter(
            (s) => String(s.class_id) === String(hw.class_id)
        ).length;

        return { submitted, total };

    };

    const isOverdue = (hw) => hw.deadline && dayjs(hw.deadline).isBefore(dayjs());

    const categorized = useMemo(() => {

        return homework.map((hw) => {

            const stats = getStats(hw);
            const overdue = isOverdue(hw);

            let category = "active";

            if (overdue) {
                category = "overdue";
            } else if (stats.submitted === 0) {
                category = "assigned";
            }

            return { ...hw, stats, category };

        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [homework, submissions, students]);

    const filtered = activeTab === "all"
        ? categorized
        : categorized.filter((hw) => hw.category === activeTab);

    const openCreate = () => {
        setEditingId(null);
        setForm(emptyForm);
        setShowModal(true);
    };

    const openEdit = (item) => {

        setEditingId(item.id);

        setForm({
            teacher_id: item.teacher_id || "",
            class_id: item.class_id || "",
            subject_id: item.subject_id || "",
            title: item.title || "",
            description: item.description || "",
            deadline: item.deadline
                ? dayjs(item.deadline).format("YYYY-MM-DDTHH:mm")
                : ""
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

        if (
            !form.teacher_id ||
            !form.class_id ||
            !form.subject_id ||
            !form.title
        ) {
            toast.error("Заповніть усі обов'язкові поля");
            return;
        }

        setSaving(true);

        try {

            const payload = {
                teacher_id: Number(form.teacher_id),
                class_id: Number(form.class_id),
                subject_id: Number(form.subject_id),
                title: form.title,
                description: form.description,
                deadline: form.deadline || null
            };

            if (editingId) {

                await updateHomework(editingId, payload);
                toast.success("Завдання оновлено");

            } else {

                await createHomework(payload);
                toast.success("Завдання додано");

            }

            closeModal();
            loadData();

        } catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.message || "Не вдалося зберегти завдання"
            );

        } finally {

            setSaving(false);

        }

    };

    const handleDelete = async (id) => {

        if (!window.confirm("Видалити це завдання?")) {
            return;
        }

        try {

            await deleteHomework(id);
            toast.success("Завдання видалено");
            loadData();

        } catch (error) {

            console.error(error);
            toast.error("Не вдалося видалити завдання");

        }

    };

    return (
        <div className="dp-page">

            <div className="dp-header">

                <h1>Домашні завдання</h1>

                <button
                    className="dp-btn dp-btn-primary"
                    onClick={openCreate}
                >
                    <FaPlus /> Додати завдання
                </button>

            </div>

            <div className="hw-tabs">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        className={`hw-tab ${activeTab === tab.id ? "active" : ""}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (

                <div className="dp-loading">Завантаження...</div>

            ) : filtered.length === 0 ? (

                <div className="dp-empty">Завдань не знайдено</div>

            ) : (

                <div className="hw-list">

                    {filtered.map((hw) => {

                        const style = getSubjectStyle(hw.subject_id);
                        const Icon = style.Icon;

                        const ratio = hw.stats.total > 0
                            ? hw.stats.submitted / hw.stats.total
                            : 0;

                        const barColor = ratio >= 0.5 ? "#2fb380" : "#e34848";

                        return (
                            <div className="hw-card" key={hw.id}>

                                <div
                                    className="hw-card-icon"
                                    style={{ background: style.bg, color: style.text }}
                                >
                                    <Icon />
                                </div>

                                <div className="hw-card-main">
                                    <div className="hw-card-title">{hw.title}</div>
                                    <div className="hw-card-sub">
                                        {hw.description || hw.subject_name}
                                    </div>
                                </div>

                                <div className="hw-card-class">
                                    {hw.class_name}
                                </div>

                                <div className="hw-card-col">
                                    <div className="hw-col-label">Дедлайн</div>
                                    <div
                                        className="hw-col-value"
                                        style={isOverdue(hw) ? { color: "#e34848" } : undefined}
                                    >
                                        {hw.deadline
                                            ? dayjs(hw.deadline).format("DD MMMM, HH:mm")
                                            : "—"}
                                    </div>
                                </div>

                                <div className="hw-card-col hw-progress-col">
                                    <div className="hw-col-label">Здано</div>
                                    <div className="hw-col-value">
                                        {hw.stats.submitted}/{hw.stats.total}
                                    </div>
                                    <div className="hw-progress-track">
                                        <div
                                            className="hw-progress-fill"
                                            style={{
                                                width: `${Math.round(ratio * 100)}%`,
                                                background: barColor
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="hw-card-actions">
                                    <button
                                        className="dp-icon-btn"
                                        onClick={() => openEdit(hw)}
                                        title="Редагувати"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        className="dp-icon-btn danger"
                                        onClick={() => handleDelete(hw.id)}
                                        title="Видалити"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>

                            </div>
                        );

                    })}

                </div>

            )}

            {showModal && (
                <div className="dp-modal-backdrop" onClick={closeModal}>

                    <div
                        className="dp-modal"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <h2>
                            {editingId ? "Редагувати завдання" : "Нове завдання"}
                        </h2>

                        <form onSubmit={handleSubmit}>

                            <div className="dp-form-group">
                                <label>Назва</label>
                                <input
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    placeholder="напр. Розв'язати вправи 1-10"
                                />
                            </div>

                            <div className="dp-form-group">
                                <label>Опис</label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                />
                            </div>

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

                            <div className="dp-form-group">
                                <label>Дедлайн</label>
                                <input
                                    type="datetime-local"
                                    name="deadline"
                                    value={form.deadline}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="dp-modal-actions">

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

export default Homework;