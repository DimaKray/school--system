import { useEffect, useMemo, useState } from "react";
import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaTimes,
    FaUserGraduate,
    FaCalendarAlt,
    FaChevronRight,
    FaGraduationCap,
    FaLayerGroup,
    FaChartLine,
    FaSchool
} from "react-icons/fa";
import { toast } from "react-toastify";
import _ from "lodash";

import {
    getClasses,
    createClass,
    updateClass,
    deleteClass
} from "../../services/classService";
import { getStudents } from "../../services/studentService";
import { getGrades } from "../../services/gradeService";
import { getClassColor } from "../../utils/classColors";
import Avatar from "../../components/Avatar";

import "../../styles/DataPage.css";
import "./Classes.css";

const emptyForm = {
    name: "",
    school_year: ""
};

function Classes() {

    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const [activeClassId, setActiveClassId] = useState(null);

    const loadData = async () => {

        setLoading(true);

        try {

            const [classesRes, studentsRes, gradesRes] = await Promise.all([
                getClasses(),
                getStudents(),
                getGrades()
            ]);

            setClasses(classesRes.data.classes || []);
            setStudents(studentsRes.data.students || []);
            setGrades(gradesRes.data.grades || []);

        } catch (error) {

            console.error(error);
            toast.error("Не вдалося завантажити класи");

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {
        loadData();
    }, []);

    const studentsByClass = useMemo(() => {
        return _.groupBy(students, "class_id");
    }, [students]);

    const averageByStudent = useMemo(() => {

        const grouped = _.groupBy(grades, "student_id");
        const result = {};

        Object.keys(grouped).forEach((studentId) => {
            const values = grouped[studentId].map((g) => g.grade);
            result[studentId] = Math.round(_.mean(values) * 10) / 10;
        });

        return result;

    }, [grades]);

    const classAverage = (classId) => {

        const list = studentsByClass[classId] || [];
        const values = list
            .map((s) => averageByStudent[s.id])
            .filter((v) => v !== undefined);

        if (values.length === 0) {
            return null;
        }

        return Math.round(_.mean(values) * 10) / 10;

    };

    const activeClass = classes.find((c) => c.id === activeClassId) || null;
    const activeStudents = activeClassId
        ? studentsByClass[activeClassId] || []
        : [];

    const openCreate = () => {
        setEditingId(null);
        setForm(emptyForm);
        setShowModal(true);
    };

    const openEdit = (item) => {

        setEditingId(item.id);

        setForm({
            name: item.name || "",
            school_year: item.school_year || ""
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

        if (!form.name || !form.school_year) {
            toast.error("Заповніть усі поля");
            return;
        }

        setSaving(true);

        try {

            if (editingId) {

                await updateClass(editingId, form);
                toast.success("Клас оновлено");

            } else {

                await createClass(form);
                toast.success("Клас додано");

            }

            closeModal();
            loadData();

        } catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.message || "Не вдалося зберегти клас"
            );

        } finally {

            setSaving(false);

        }

    };

    const handleDelete = async (id, e) => {

        e.stopPropagation();

        if (!window.confirm("Видалити цей клас?")) {
            return;
        }

        try {

            await deleteClass(id);
            toast.success("Клас видалено");

            if (activeClassId === id) {
                setActiveClassId(null);
            }

            loadData();

        } catch (error) {

            console.error(error);
            toast.error("Не вдалося видалити клас");

        }

    };

    const handleEditClick = (item, e) => {
        e.stopPropagation();
        openEdit(item);
    };

    return (
        <div className="dp-page">

            <div className="dp-header">

                <div className="cls-title-row">

                    <div className="cls-header-icon-chip">
                        <FaLayerGroup />
                    </div>

                    <div>
                        <h1>Класи</h1>
                        <div className="dp-header-sub">
                            Усього класів: {classes.length}
                        </div>
                    </div>

                </div>

                <button
                    className="dp-btn dp-btn-primary"
                    onClick={openCreate}
                >
                    <FaPlus /> Додати клас
                </button>

            </div>

            <div className="cls-grid">

                {classes.map((c) => {

                    const roster = studentsByClass[c.id] || [];
                    const avg = classAverage(c.id);
                    const color = getClassColor(c.id);

                    return (
                        <div
                            key={c.id}
                            className="cls-card"
                            style={{ borderTopColor: color.text }}
                            onClick={() => setActiveClassId(c.id)}
                        >

                            <FaGraduationCap
                                className="cls-card-watermark"
                                style={{ color: color.text }}
                            />

                            <div className="cls-card-top">

                                <span
                                    className="cls-name-badge"
                                    style={{ background: color.bg, color: color.text }}
                                >
                                    {c.name}
                                </span>

                                <div className="cls-card-actions">

                                    <button
                                        className="dp-icon-btn"
                                        onClick={(e) => handleEditClick(c, e)}
                                        title="Редагувати"
                                    >
                                        <FaEdit />
                                    </button>

                                    <button
                                        className="dp-icon-btn danger"
                                        onClick={(e) => handleDelete(c.id, e)}
                                        title="Видалити"
                                    >
                                        <FaTrash />
                                    </button>

                                </div>

                            </div>

                            <div className="cls-year">
                                <FaCalendarAlt /> {c.school_year}
                            </div>

                            <div className="cls-card-bottom">

                                <div className="cls-avatar-stack">

                                    {roster.slice(0, 5).map((s) => (
                                        <div
                                            className="cls-avatar-stack-item"
                                            key={s.id}
                                        >
                                            <Avatar
                                                photoUrl={s.photo_url}
                                                firstName={s.first_name}
                                                lastName={s.last_name}
                                                size={30}
                                            />
                                        </div>
                                    ))}

                                    {roster.length > 5 && (
                                        <div className="cls-avatar-more">
                                            +{roster.length - 5}
                                        </div>
                                    )}

                                    {roster.length === 0 && (
                                        <span className="cls-empty-roster">
                                            Учнів ще немає
                                        </span>
                                    )}

                                </div>

                                <div className="cls-stats">

                                    <span className="cls-stat">
                                        <FaUserGraduate /> {roster.length}
                                    </span>

                                    {avg !== null && (
                                        <span className="cls-stat cls-stat-grade">
                                            <FaChartLine /> {avg}
                                        </span>
                                    )}

                                </div>

                            </div>

                            <div className="cls-open-hint">
                                Детальніше <FaChevronRight />
                            </div>

                        </div>
                    );

                })}

            </div>

            {loading && (
                <div className="dp-loading">Завантаження...</div>
            )}

            {!loading && classes.length === 0 && (
                <div className="dp-empty">
                    <FaSchool className="cls-empty-icon" />
                    <div>Класів не знайдено</div>
                </div>
            )}

            {activeClass && (

                <div
                    className="cls-drawer-backdrop"
                    onClick={() => setActiveClassId(null)}
                >

                    <div
                        className="cls-drawer"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="cls-drawer-header">

                            <div>
                                <span className="cls-name-badge cls-name-badge-lg">
                                    {activeClass.name}
                                </span>
                                <div className="dp-header-sub" style={{ marginTop: 8 }}>
                                    Навчальний рік: {activeClass.school_year}
                                </div>
                            </div>

                            <button
                                className="dp-icon-btn"
                                onClick={() => setActiveClassId(null)}
                                title="Закрити"
                            >
                                <FaTimes />
                            </button>

                        </div>

                        <div className="cls-drawer-summary">

                            <div className="cls-summary-item">
                                <div className="cls-summary-icon cls-summary-icon-purple">
                                    <FaUserGraduate />
                                </div>
                                <div className="cls-summary-value">
                                    {activeStudents.length}
                                </div>
                                <div className="cls-summary-label">Учнів</div>
                            </div>

                            <div className="cls-summary-item">
                                <div className="cls-summary-icon cls-summary-icon-green">
                                    <FaChartLine />
                                </div>
                                <div className="cls-summary-value">
                                    {classAverage(activeClass.id) ?? "—"}
                                </div>
                                <div className="cls-summary-label">Середній бал</div>
                            </div>

                        </div>

                        <div className="cls-drawer-list-title">
                            <span>Список учнів</span>
                            <span>{activeStudents.length}</span>
                        </div>

                        <div className="cls-drawer-list">

                            {activeStudents.map((s) => (
                                <div className="cls-student-row" key={s.id}>

                                    <Avatar
                                        photoUrl={s.photo_url}
                                        firstName={s.first_name}
                                        lastName={s.last_name}
                                        size={40}
                                    />

                                    <div className="cls-student-info">
                                        <div className="cls-student-name">
                                            {s.first_name} {s.last_name}
                                        </div>
                                        <div className="cls-student-email">
                                            {s.email}
                                        </div>
                                    </div>

                                    <div className="cls-student-grade">
                                        {averageByStudent[s.id] ?? "—"}
                                    </div>

                                </div>
                            ))}

                            {activeStudents.length === 0 && (
                                <div className="dp-empty">
                                    У цьому класі поки немає учнів
                                </div>
                            )}

                        </div>

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
                            {editingId ? "Редагувати клас" : "Новий клас"}
                        </h2>

                        <form onSubmit={handleSubmit}>

                            <div className="dp-form-group">
                                <label>Назва класу</label>
                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="напр. 10-А"
                                />
                            </div>

                            <div className="dp-form-group">
                                <label>Навчальний рік</label>
                                <input
                                    name="school_year"
                                    value={form.school_year}
                                    onChange={handleChange}
                                    placeholder="напр. 2025/2026"
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

export default Classes;