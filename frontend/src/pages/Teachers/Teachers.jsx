import { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";

import {
    getTeachers,
    createTeacher,
    updateTeacher,
    deleteTeacher
} from "../../services/teacherService";
import { uploadPhoto } from "../../services/uploadService";
import Avatar from "../../components/Avatar";

import "../../styles/DataPage.css";

const emptyForm = {
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    specialization: "",
    phone: "",
    photo_url: ""
};

function Teachers() {

    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

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

            const { data } = await getTeachers();
            setTeachers(data.teachers || []);

        } catch (error) {

            console.error(error);
            toast.error("Не вдалося завантажити вчителів");

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
        setPhotoFile(null);
        setPhotoPreview(null);
        setShowModal(true);
    };

    const openEdit = (teacher) => {

        setEditingId(teacher.id);
        setPhotoFile(null);
        setPhotoPreview(null);

        setForm({
            first_name: teacher.first_name || "",
            last_name: teacher.last_name || "",
            email: teacher.email || "",
            password: "",
            specialization: teacher.subject || "",
            phone: teacher.phone || "",
            photo_url: teacher.photo_url || ""
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
            toast.error("Вкажіть пароль для нового вчителя");
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

            if (editingId) {

                await updateTeacher(editingId, {
                    first_name: form.first_name,
                    last_name: form.last_name,
                    email: form.email,
                    subject: form.specialization,
                    phone: form.phone,
                    photo_url: photoUrl
                });

                toast.success("Дані вчителя оновлено");

            } else {

                await createTeacher({ ...form, photo_url: photoUrl });
                toast.success("Вчителя додано");

            }

            closeModal();
            loadData();

        } catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.message || "Не вдалося зберегти вчителя"
            );

        } finally {

            setSaving(false);
            setUploadingPhoto(false);

        }

    };

    const handleDelete = async (id) => {

        if (!window.confirm("Видалити цього вчителя?")) {
            return;
        }

        try {

            await deleteTeacher(id);
            toast.success("Вчителя видалено");
            loadData();

        } catch (error) {

            console.error(error);
            toast.error("Не вдалося видалити вчителя");

        }

    };

    const filtered = teachers.filter((t) => {

        const fullName = `${t.first_name} ${t.last_name}`.toLowerCase();

        return fullName.includes(search.toLowerCase()) ||
            (t.email || "").toLowerCase().includes(search.toLowerCase());

    });

    return (
        <div className="dp-page">

            <div className="dp-header">

                <div>
                    <h1>Вчителі</h1>
                    <div className="dp-header-sub">
                        Усього вчителів: {teachers.length}
                    </div>
                </div>

                <div style={{ display: "flex", gap: 12 }}>

                    <input
                        className="dp-search"
                        placeholder="Пошук за ім'ям або email"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <button
                        className="dp-btn dp-btn-primary"
                        onClick={openCreate}
                    >
                        <FaPlus /> Додати вчителя
                    </button>

                </div>

            </div>

            <div className="dp-card">

                <div className="dp-table-wrap">

                    <table className="dp-table">

                        <thead>
                            <tr>
                                <th>ПІБ</th>
                                <th>Email</th>
                                <th>Спеціалізація</th>
                                <th>Телефон</th>
                                <th></th>
                            </tr>
                        </thead>

                        <tbody>
                            {filtered.map((t) => (
                                <tr key={t.id}>
                                    <td style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <Avatar
                                            photoUrl={t.photo_url}
                                            firstName={t.first_name}
                                            lastName={t.last_name}
                                            size={32}
                                        />
                                        {t.first_name} {t.last_name}
                                    </td>
                                    <td>{t.email}</td>
                                    <td>
                                        {t.subject
                                            ? <span className="dp-badge">{t.subject}</span>
                                            : "—"}
                                    </td>
                                    <td>{t.phone || "—"}</td>
                                    <td>
                                        <div className="dp-actions">
                                            <button
                                                className="dp-icon-btn"
                                                onClick={() => openEdit(t)}
                                                title="Редагувати"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                className="dp-icon-btn danger"
                                                onClick={() => handleDelete(t.id)}
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

                    {!loading && filtered.length === 0 && (
                        <div className="dp-empty">Вчителів не знайдено</div>
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
                            {editingId ? "Редагувати вчителя" : "Новий вчитель"}
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
                                        htmlFor="teacher-photo-input"
                                        className="dp-btn dp-btn-secondary"
                                        style={{ display: "inline-flex", cursor: "pointer" }}
                                    >
                                        Обрати фото
                                    </label>

                                    <input
                                        id="teacher-photo-input"
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

                            <div className="dp-form-group">
                                <label>Спеціалізація</label>
                                <input
                                    name="specialization"
                                    value={form.specialization}
                                    onChange={handleChange}
                                    placeholder="напр. Математика"
                                />
                            </div>

                            <div className="dp-form-group">
                                <label>Телефон</label>
                                <input
                                    name="phone"
                                    value={form.phone}
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

export default Teachers;