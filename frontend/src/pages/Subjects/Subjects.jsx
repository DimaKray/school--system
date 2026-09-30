import { useEffect, useMemo, useState } from "react";
import { FaPlus, FaTimes, FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import _ from "lodash";

import {
    getSubjects,
    createSubject,
    updateSubject,
    deleteSubject
} from "../../services/subjectService";
import { getTeachers } from "../../services/teacherService";
import { getSchedule } from "../../services/scheduleService";
import { getGrades } from "../../services/gradeService";
import { getSubjectStyle } from "../../utils/subjectStyle";

import "../../styles/DataPage.css";
import "./Subjects.css";

const emptyForm = {
    name: "",
    teacher_id: "",
    description: ""
};

function Subjects() {

    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [schedule, setSchedule] = useState([]);
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);

    const [detailSubject, setDetailSubject] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const loadData = async () => {

        setLoading(true);

        try {

            const [subjectsRes, teachersRes, scheduleRes, gradesRes] =
                await Promise.all([
                    getSubjects(),
                    getTeachers(),
                    getSchedule(),
                    getGrades()
                ]);

            setSubjects(subjectsRes.data.subjects || []);
            setTeachers(teachersRes.data.teachers || []);
            setSchedule(scheduleRes.data.schedule || []);
            setGrades(gradesRes.data.grades || []);

        } catch (error) {

            console.error(error);
            toast.error("Не вдалося завантажити предмети");

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {
        loadData();
    }, []);

    const openCreate = () => {
        setEditingId(null);
        setForm(emptyForm);
        setShowModal(true);
    };

    const openEdit = (subject) => {

        setEditingId(subject.id);

        setForm({
            name: subject.name || "",
            teacher_id: subject.teacher_id || "",
            description: subject.description || ""
        });

        setShowModal(true);
        setDetailSubject(null);

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

        if (!form.name) {
            toast.error("Вкажіть назву предмета");
            return;
        }

        setSaving(true);

        try {

            const payload = {
                name: form.name,
                teacher_id: form.teacher_id || null,
                description: form.description
            };

            if (editingId) {

                await updateSubject(editingId, payload);
                toast.success("Предмет оновлено");

            } else {

                await createSubject(payload);
                toast.success("Предмет додано");

            }

            closeModal();
            loadData();

        } catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.message || "Не вдалося зберегти предмет"
            );

        } finally {

            setSaving(false);

        }

    };

    const handleDelete = async (id) => {

        if (!window.confirm("Видалити цей предмет?")) {
            return;
        }

        try {

            await deleteSubject(id);
            toast.success("Предмет видалено");
            setDetailSubject(null);
            loadData();

        } catch (error) {

            console.error(error);
            toast.error("Не вдалося видалити предмет");

        }

    };

    const getSubjectStats = (subjectId) => {

        const subjectSchedule = schedule.filter(
            (s) => String(s.subject_id) === String(subjectId)
        );

        const classNames = _.uniq(subjectSchedule.map((s) => s.class_name));

        const subjectGrades = grades.filter(
            (g) => String(g.subject_id) === String(subjectId)
        );

        const average = subjectGrades.length > 0
            ? Math.round(_.meanBy(subjectGrades, "grade") * 10) / 10
            : null;

        return { classNames, average, gradesCount: subjectGrades.length };

    };

    return (
        <div className="dp-page">

            <div className="dp-header">

                <div>
                    <h1>Предмети</h1>
                    <div className="dp-header-sub">
                        Усього предметів: {subjects.length}
                    </div>
                </div>

                <button
                    className="dp-btn dp-btn-primary"
                    onClick={openCreate}
                >
                    <FaPlus /> Додати предмет
                </button>

            </div>

            {loading ? (

                <div className="dp-loading">Завантаження...</div>

            ) : subjects.length === 0 ? (

                <div className="dp-empty">Предметів не знайдено</div>

            ) : (

                <div className="sub-grid">

                    {subjects.map((s) => {

                        const style = getSubjectStyle(s.id);
                        const Icon = style.Icon;

                        return (
                            <button
                                key={s.id}
                                type="button"
                                className="sub-card"
                                onClick={() => setDetailSubject(s)}
                            >

                                <div
                                    className="sub-card-icon"
                                    style={{ background: style.bg, color: style.text }}
                                >
                                    <Icon />
                                </div>

                                <div className="sub-card-name">{s.name}</div>

                                <div className="sub-card-teacher">
                                    {s.first_name
                                        ? `${s.first_name} ${s.last_name}`
                                        : "Немає вчителя"}
                                </div>

                            </button>
                        );

                    })}

                </div>

            )}

            {detailSubject && (() => {

                const style = getSubjectStyle(detailSubject.id);
                const Icon = style.Icon;
                const stats = getSubjectStats(detailSubject.id);

                return (
                    <div
                        className="dp-modal-backdrop"
                        onClick={() => setDetailSubject(null)}
                    >

                        <div
                            className="dp-modal"
                            onClick={(e) => e.stopPropagation()}
                        >

                            <div className="sub-detail-head">

                                <div
                                    className="sub-detail-icon"
                                    style={{ background: style.bg, color: style.text }}
                                >
                                    <Icon />
                                </div>

                                <div>
                                    <h2 style={{ marginBottom: 2 }}>{detailSubject.name}</h2>
                                    <div className="sub-detail-teacher">
                                        {detailSubject.first_name
                                            ? `Вчитель: ${detailSubject.first_name} ${detailSubject.last_name}`
                                            : "Вчитель не призначений"}
                                    </div>
                                </div>

                            </div>

                            <div className="sub-detail-section">
                                <div className="sub-detail-label">Опис</div>
                                <p className="sub-detail-text">
                                    {detailSubject.description || "Опис ще не додано."}
                                </p>
                            </div>

                            <div className="sub-detail-stats">

                                <div className="sub-stat">
                                    <div className="sub-stat-value">
                                        {stats.classNames.length}
                                    </div>
                                    <div className="sub-stat-label">Класів</div>
                                </div>

                                <div className="sub-stat">
                                    <div className="sub-stat-value">
                                        {stats.average ?? "—"}
                                    </div>
                                    <div className="sub-stat-label">Середній бал</div>
                                </div>

                                <div className="sub-stat">
                                    <div className="sub-stat-value">
                                        {stats.gradesCount}
                                    </div>
                                    <div className="sub-stat-label">Оцінок</div>
                                </div>

                            </div>

                            {stats.classNames.length > 0 && (
                                <div className="sub-detail-section">
                                    <div className="sub-detail-label">Викладається в класах</div>
                                    <div className="sub-class-badges">
                                        {stats.classNames.map((name) => (
                                            <span key={name} className="dp-badge">{name}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="dp-modal-actions">

                                <button
                                    type="button"
                                    className="dp-btn dp-btn-danger"
                                    onClick={() => handleDelete(detailSubject.id)}
                                    style={{ marginRight: "auto" }}
                                >
                                    <FaTrash /> Видалити
                                </button>

                                <button
                                    type="button"
                                    className="dp-btn dp-btn-secondary"
                                    onClick={() => setDetailSubject(null)}
                                >
                                    Закрити
                                </button>

                                <button
                                    type="button"
                                    className="dp-btn dp-btn-primary"
                                    onClick={() => openEdit(detailSubject)}
                                >
                                    <FaEdit /> Редагувати
                                </button>

                            </div>

                        </div>

                    </div>
                );

            })()}

            {showModal && (
                <div className="dp-modal-backdrop" onClick={closeModal}>

                    <div
                        className="dp-modal"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <h2>
                            {editingId ? "Редагувати предмет" : "Новий предмет"}
                        </h2>

                        <form onSubmit={handleSubmit}>

                            <div className="dp-form-group">
                                <label>Назва предмета</label>
                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="напр. Алгебра"
                                />
                            </div>

                            <div className="dp-form-group">
                                <label>Вчитель</label>
                                <select
                                    name="teacher_id"
                                    value={form.teacher_id}
                                    onChange={handleChange}
                                >
                                    <option value="">—</option>
                                    {teachers.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.first_name} {t.last_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="dp-form-group">
                                <label>Опис</label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Короткий опис предмета, програма, вимоги..."
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

export default Subjects;