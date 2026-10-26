import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaPlus } from "react-icons/fa";

import { getParents, addChild, removeChild } from "../../services/parentService";
import { getStudents } from "../../services/studentService";

import "../../styles/DataPage.css";
import "../Reports/Reports.css";

/*
 * Керування зв'язками «батьки — дитина» (таблиця parent_students).
 * Батьки бачать оцінки, відвідуваність і домашні завдання лише своїх дітей.
 */
function Parents() {

    const [parents, setParents] = useState([]);
    const [students, setStudents] = useState([]);
    const [selected, setSelected] = useState({});
    const [loading, setLoading] = useState(true);

    const loadData = async () => {

        setLoading(true);

        try {

            const [parentsRes, studentsRes] = await Promise.all([getParents(), getStudents()]);
            setParents(parentsRes.data.parents || []);
            setStudents(studentsRes.data.students || []);

        } catch (error) {

            toast.error(error.response?.data?.message || "Не вдалося завантажити дані");

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAdd = async (parentId) => {

        const studentId = selected[parentId];

        if (!studentId) {
            toast.error("Оберіть учня");
            return;
        }

        try {

            await addChild(parentId, Number(studentId));
            toast.success("Дитину прив'язано");
            setSelected({ ...selected, [parentId]: "" });
            loadData();

        } catch (error) {

            toast.error(error.response?.data?.message || "Не вдалося прив'язати дитину");

        }

    };

    const handleRemove = async (parentId, studentId) => {

        if (!window.confirm("Видалити зв'язок з дитиною?")) {
            return;
        }

        try {

            await removeChild(parentId, studentId);
            toast.success("Зв'язок видалено");
            loadData();

        } catch (error) {

            toast.error(error.response?.data?.message || "Не вдалося видалити зв'язок");

        }

    };

    return (
        <div className="dp-page">

            <div className="dp-header">
                <div>
                    <h1>Батьки</h1>
                    <div className="dp-header-sub">
                        Прив'язка облікових записів батьків до учнів
                    </div>
                </div>
            </div>

            <div className="dp-card">
                {loading ? (
                    <div className="dp-loading">Завантаження...</div>
                ) : parents.length === 0 ? (
                    <div className="dp-empty">
                        Користувачів з роллю «Батьки» ще немає. Вони можуть зареєструватися самостійно.
                    </div>
                ) : (
                    <div className="dp-table-wrap">
                        <table className="dp-table">
                            <thead>
                                <tr>
                                    <th>Батьки</th>
                                    <th>Email</th>
                                    <th>Діти</th>
                                    <th>Додати дитину</th>
                                </tr>
                            </thead>
                            <tbody>
                                {parents.map((p) => {

                                    const linkedIds = new Set(p.children.map((c) => c.student_id));

                                    return (
                                        <tr key={p.id}>
                                            <td>{p.last_name} {p.first_name}</td>
                                            <td>{p.email}</td>
                                            <td>
                                                {p.children.length === 0 ? "—" : p.children.map((c) => (
                                                    <span className="rp-chip" key={c.student_id}>
                                                        {c.last_name} {c.first_name}
                                                        {c.class_name ? ` (${c.class_name})` : ""}
                                                        <button
                                                            type="button"
                                                            title="Видалити зв'язок"
                                                            onClick={() => handleRemove(p.id, c.student_id)}
                                                        >
                                                            ✕
                                                        </button>
                                                    </span>
                                                ))}
                                            </td>
                                            <td>
                                                <div className="rp-inline">
                                                    <select
                                                        value={selected[p.id] || ""}
                                                        onChange={(e) => setSelected({ ...selected, [p.id]: e.target.value })}
                                                    >
                                                        <option value="">Оберіть учня</option>
                                                        {students
                                                            .filter((s) => !linkedIds.has(s.id))
                                                            .map((s) => (
                                                                <option key={s.id} value={s.id}>
                                                                    {s.last_name} {s.first_name}
                                                                    {s.class_name ? ` (${s.class_name})` : ""}
                                                                </option>
                                                            ))}
                                                    </select>
                                                    <button
                                                        type="button"
                                                        className="dp-icon-btn"
                                                        title="Прив'язати"
                                                        onClick={() => handleAdd(p.id)}
                                                    >
                                                        <FaPlus />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );

                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

        </div>
    );

}

export default Parents;
