import { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import dayjs from "dayjs";

import {
    getGrades,
    createGrade,
    updateGrade,
    deleteGrade
} from "../../services/gradeService";
import { getStudents } from "../../services/studentService";
import { getSubjects } from "../../services/subjectService";
import { getTeachers } from "../../services/teacherService";

import "../../styles/DataPage.css";

const emptyForm = {
    student_id: "",
    subject_id: "",
    teacher_id: "",
    grade: "",
    comment: ""
};

function Grades() {

    const [grades, setGrades] = useState([]);
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const loadData = async () => {

        setLoading(true);

        try {

            const [
                gradesRes,
                studentsRes,
                subjectsRes,
                teachersRes
            ] = await Promise.all([
                getGrades(),
                getStudents(),
                getSubjects(),
                getTeachers()
            ]);

            setGrades(gradesRes.data.grades || []);
            setStudents(studentsRes.data.students || []);
            setSubjects(subjectsRes.data.subjects || []);
            setTeachers(teachersRes.data.teachers || []);

        } catch (error) {

            console.error(error);
            toast.error("Не вдалося завантажити оцінки");

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

    const openEdit = (item) => {

        setEditingId(item.id);

        setForm({
            student_id: item.student_id || "",
            subject_id: item.subject_id || "",
            teacher_id: item.teacher_id || "",
            grade: String(item.grade || ""),
            comment: item.comment || ""
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
            !form.student_id ||
            !form.subject_id ||
            !form.teacher_id ||
            !form.grade
        ) {
            toast.error("Заповніть усі обов'язкові поля");
            return;
        }

        const gradeNum = Number(form.grade);

        if (gradeNum < 1 || gradeNum > 12) {
            toast.error("Оцінка має бути від 1 до 12");
            return;
        }

        setSaving(true);

        try {

            const payload = {
                student_id: Number(form.student_id),
                subject_id: Number(form.subject_id),
                teacher_id: Number(form.teacher_id),
                grade: gradeNum,
                comment: form.comment
            };

            if (editingId) {

                await updateGrade(editingId, payload);
                toast.success("Оцінку оновлено");

            } else {

                await createGrade(payload);
                toast.success("Оцінку виставлено");

            }

            closeModal();
            loadData();

        } catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.message || "Не вдалося зберегти оцінку"
            );

        } finally {

            setSaving(false);

        }

    };

    const handleDelete = async (id) => {

        if (!window.confirm("Видалити цю оцінку?")) {
            return;
        }

        try {

            await deleteGrade(id);
            toast.success("Оцінку видалено");
            loadData();

        } catch (error) {

            console.error(error);
            toast.error("Не вдалося видалити оцінку");

        }

    };

    const gradeColor = (g) => {
        if (g >= 10) return "#2fb380";
        if (g >= 7) return "#7367F0";
        if (g >= 4) return "#e0a020";
        return "#e34848";
    };

    return (
        <div className="dp-page">

            <div className="dp-header">

                <div>
                    <h1>Оцінки</h1>
                    <div className="dp-header-sub">
                        Усього записів: {grades.length}
                    </div>
                </div>

                <button
                    className="dp-btn dp-btn-primary"
                    onClick={openCreate}
                >
                    <FaPlus /> Виставити оцінку
                </button>

            </div>

            <div className="dp-card">

                <div className="dp-table-wrap">

                    <table className="dp-table">

                        <thead>
                            <tr>
                                <th>Учень</th>
                                <th>Предмет</th>
                                <th>Вчитель</th>
                                <th>Оцінка</th>
                                <th>Коментар</th>
                                <th>Дата</th>
                                <th></th>
                            </tr>
                        </thead>

                        <tbody>
                            {grades.map((g) => (
                                <tr key={g.id}>
                                    <td>
                                        {g.student_first_name} {g.student_last_name}
                                    </td>
                                    <td>{g.subject_name}</td>
                                    <td>
                                        {g.teacher_first_name} {g.teacher_last_name}
                                    </td>
                                    <td>
                                        <span
                                            className="dp-badge"
                                            style={{
                                                background: `${gradeColor(g.grade)}1a`,
                                                color: gradeColor(g.grade)
                                            }}
                                        >
                                            {g.grade}
                                        </span>
                                    </td>
                                    <td>{g.comment || "—"}</td>
                                    <td>
                                        {g.created_at
                                            ? dayjs(g.created_at).format("DD.MM.YYYY")
                                            : "—"}
                                    </td>
                                    <td>
                                        <div className="dp-actions">
                                            <button
                                                className="dp-icon-btn"
                                                onClick={() => openEdit(g)}
                                                title="Редагувати"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                className="dp-icon-btn danger"
                                                onClick={() => handleDelete(g.id)}
                                                title="Видалити"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                    </table>

                    {loading && (
                        <div className="dp-loading">Завантаження...</div>
                    )}

                    {!loading && grades.length === 0 && (
                        <div className="dp-empty">Оцінок ще немає</div>
                    )}

                </div>

            </div>

            {showModal && (
                <div className="dp-modal-backdrop" onClick={closeModal}>

                    <div
                        className="dp-modal"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <h2>
                            {editingId ? "Редагувати оцінку" : "Нова оцінка"}
                        </h2>

                        <form onSubmit={handleSubmit}>

                            <div className="dp-form-group">
                                <label>Учень</label>
                                <select
                                    name="student_id"
                                    value={form.student_id}
                                    onChange={handleChange}
                                >
                                    <option value="">Оберіть учня</option>
                                    {students.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.first_name} {s.last_name}
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
                                <label>Оцінка (1-12)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="12"
                                    name="grade"
                                    value={form.grade}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="dp-form-group">
                                <label>Коментар</label>
                                <textarea
                                    name="comment"
                                    value={form.comment}
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

export default Grades;
