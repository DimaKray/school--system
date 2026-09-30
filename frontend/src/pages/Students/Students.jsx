import { useEffect, useMemo, useState } from "react";
import { FaPlus, FaTimes, FaSearch } from "react-icons/fa";
import { toast } from "react-toastify";
import _ from "lodash";

import {
    getStudents,
    createStudent,
    updateStudent,
    deleteStudent
} from "../../services/studentService";
import { getClasses } from "../../services/classService";
import { getGrades } from "../../services/gradeService";
import { uploadPhoto } from "../../services/uploadService";
import Avatar from "../../components/Avatar";
import ActionsMenu from "../../components/ActionsMenu";

import "../../styles/DataPage.css";
import "./Students.css";

const emptyForm = {
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    class_id: "",
    birth_date: "",
    phone: "",
    address: "",
    photo_url: ""
};

function Students() {

    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [classFilter, setClassFilter] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    const loadData = async () => {

        setLoading(true);

        try {

            const [studentsRes, classesRes, gradesRes] = await Promise.all([
                getStudents(),
                getClasses(),
                getGrades()
            ]);

            setStudents(studentsRes.data.students || []);
            setClasses(classesRes.data.classes || []);
            setGrades(gradesRes.data.grades || []);

        } catch (error) {

            console.error(error);
            toast.error("Не вдалося завантажити учнів");

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {
        loadData();
    }, []);

    const averageByStudent = useMemo(() => {

        const grouped = _.groupBy(grades, "student_id");

        const result = {};

        Object.keys(grouped).forEach((studentId) => {

            const values = grouped[studentId].map((g) => g.grade);
            result[studentId] = Math.round(_.mean(values) * 10) / 10;

        });

        return result;

    }, [grades]);

    const openCreate = () => {
        setEditingId(null);
        setForm(emptyForm);
        setPhotoFile(null);
        setPhotoPreview(null);
        setShowModal(true);
    };

    const openEdit = (student) => {

        setEditingId(student.id);
        setPhotoFile(null);
        setPhotoPreview(null);

        setForm({
            first_name: student.first_name || "",
            last_name: student.last_name || "",
            email: student.email || "",
            password: "",
            class_id: student.class_id || "",
            birth_date: student.birth_date
                ? student.birth_date.substring(0, 10)
                : "",
            phone: student.phone || "",
            address: student.address || "",
            photo_url: student.photo_url || ""
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

    const handlePhotoSelect = (e) => {

        const file = e.target.files[0];

        if (!file) {
            return;
        }

        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!form.first_name || !form.last_name || !form.email) {
            toast.error("Заповніть обов'язкові поля");
            return;
        }

        if (!editingId && !form.password) {
            toast.error("Вкажіть пароль для нового учня");
            return;
        }

        setSaving(true);

        try {

            let photoUrl = form.photo_url;

            if (photoFile) {

                setUploadingPhoto(true);

                const uploadRes = await uploadPhoto(photoFile);
                photoUrl = uploadRes.data.url;

                setUploadingPhoto(false);

            }

            const payload = {
                ...form,
                class_id: form.class_id || null,
                photo_url: photoUrl
            };

            if (editingId) {

                await updateStudent(editingId, payload);
                toast.success("Дані учня оновлено");

            } else {

                await createStudent(payload);
                toast.success("Учня додано");

            }

            closeModal();
            loadData();

        } catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.message || "Не вдалося зберегти учня"
            );

        } finally {

            setSaving(false);
            setUploadingPhoto(false);

        }

    };

    const handleDelete = async (id) => {

        if (!window.confirm("Видалити цього учня?")) {
            return;
        }

        try {

            await deleteStudent(id);
            toast.success("Учня видалено");
            loadData();

        } catch (error) {

            console.error(error);
            toast.error("Не вдалося видалити учня");

        }

    };

    const filtered = students.filter((s) => {

        const fullName = `${s.first_name} ${s.last_name}`.toLowerCase();

        const matchesSearch =
            fullName.includes(search.toLowerCase()) ||
            (s.email || "").toLowerCase().includes(search.toLowerCase());

        const matchesClass =
            !classFilter || String(s.class_id) === String(classFilter);

        return matchesSearch && matchesClass;

    });

    return (
        <div className="dp-page">

            <div className="dp-header">

                <h1>Учні</h1>

                <button
                    className="dp-btn dp-btn-primary"
                    onClick={openCreate}
                >
                    <FaPlus /> Додати учня
                </button>

            </div>

            <div className="st-filters">

                <div className="st-filter-group">
                    <label>Клас</label>
                    <select
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
                </div>

                <div className="st-search">
                    <FaSearch className="st-search-icon" />
                    <input
                        placeholder="Пошук учнів..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

            </div>

            <div className="dp-card">

                <div className="dp-table-wrap">

                    <table className="dp-table">

                        <thead>
                            <tr>
                                <th>Учень</th>
                                <th>Email</th>
                                <th>Телефон</th>
                                <th>Середній бал</th>
                                <th>Дії</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filtered.map((s) => (
                                <tr key={s.id}>
                                    <td className="st-name-cell">
                                        <Avatar
                                            photoUrl={s.photo_url}
                                            firstName={s.first_name}
                                            lastName={s.last_name}
                                            size={36}
                                        />
                                        <span>{s.first_name} {s.last_name}</span>
                                    </td>
                                    <td className="st-muted">{s.email}</td>
                                    <td className="st-muted">{s.phone || "—"}</td>
                                    <td className="st-avg">
                                        {averageByStudent[s.id] ?? "—"}
                                    </td>
                                    <td>
                                        <ActionsMenu
                                            onEdit={() => openEdit(s)}
                                            onDelete={() => handleDelete(s.id)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                    </table>

                    {loading && (
                        <div className="dp-loading">Завантаження...</div>
                    )}

                    {!loading && filtered.length === 0 && (
                        <div className="dp-empty">Учнів не знайдено</div>
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
                            {editingId ? "Редагувати учня" : "Новий учень"}
                        </h2>

                        <form onSubmit={handleSubmit}>

                            <div className="dp-form-group" style={{ textAlign: "center" }}>

                                <Avatar
                                    photoUrl={photoPreview || form.photo_url}
                                    firstName={form.first_name}
                                    lastName={form.last_name}
                                    size={72}
                                />

                                <div style={{ marginTop: 10 }}>

                                    <label
                                        htmlFor="student-photo-input"
                                        className="dp-btn dp-btn-secondary"
                                        style={{ display: "inline-flex", cursor: "pointer" }}
                                    >
                                        Обрати фото
                                    </label>

                                    <input
                                        id="student-photo-input"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handlePhotoSelect}
                                        style={{ display: "none" }}
                                    />

                                </div>

                            </div>

                            <div className="dp-form-grid">

                                <div className="dp-form-group">
                                    <label>Ім'я</label>
                                    <input
                                        name="first_name"
                                        value={form.first_name}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="dp-form-group">
                                    <label>Прізвище</label>
                                    <input
                                        name="last_name"
                                        value={form.last_name}
                                        onChange={handleChange}
                                    />
                                </div>

                            </div>

                            <div className="dp-form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                />
                            </div>

                            {!editingId && (
                                <div className="dp-form-group">
                                    <label>Пароль</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                    />
                                </div>
                            )}

                            <div className="dp-form-grid">

                                <div className="dp-form-group">
                                    <label>Клас</label>
                                    <select
                                        name="class_id"
                                        value={form.class_id}
                                        onChange={handleChange}
                                    >
                                        <option value="">—</option>
                                        {classes.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="dp-form-group">
                                    <label>Дата народження</label>
                                    <input
                                        type="date"
                                        name="birth_date"
                                        value={form.birth_date}
                                        onChange={handleChange}
                                    />
                                </div>

                            </div>

                            <div className="dp-form-group">
                                <label>Телефон</label>
                                <input
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="dp-form-group">
                                <label>Адреса</label>
                                <input
                                    name="address"
                                    value={form.address}
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
                                    {uploadingPhoto
                                        ? "Завантаження фото..."
                                        : saving
                                            ? "Збереження..."
                                            : "Зберегти"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
}

export default Students;