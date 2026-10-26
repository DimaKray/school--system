import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { FaDownload } from "react-icons/fa";

import {
    getReportSummary,
    getStudentAverages,
    getClassAverages,
    getSubjectStats,
    getSubjectPerformance,
    getUnsatisfactory,
    getAboveClassAverage,
    getAttendanceReport
} from "../../services/reportService";
import { getClasses } from "../../services/classService";
import { getSubjects } from "../../services/subjectService";

import "../../styles/DataPage.css";
import "./Reports.css";

/*
 * Сторінка звітів і статистики. Усі розрахунки виконуються SQL-запитами
 * на сервері (GROUP BY, AVG, COUNT, RANK, підзапити) — див. backend/models/reportModel.js
 */

const TABS = [
    { id: "rating", label: "Рейтинг учнів" },
    { id: "classes", label: "Класи" },
    { id: "subjects", label: "Предмети" },
    { id: "low", label: "Незадовільні оцінки" },
    { id: "above", label: "Вище середнього класу" },
    { id: "attendance", label: "Відвідуваність" }
];

// PostgreSQL повертає NUMERIC рядком — приводимо до числа для відображення
const num = (v, digits = 2) =>
    v === null || v === undefined ? "—" : Number(v).toFixed(digits).replace(/\.?0+$/, "");

const fullName = (r) => `${r.last_name} ${r.first_name}`;

// Колонки таблиць кожного звіту: [заголовок, функція значення]
const COLUMNS = {
    rating: [
        ["Місце", (r) => r.rank],
        ["Учень", fullName],
        ["Клас", (r) => r.class_name || "—"],
        ["Оцінок", (r) => r.grades_count],
        ["Середній бал", (r) => num(r.avg_grade)],
        ["Мін.", (r) => r.min_grade ?? "—"],
        ["Макс.", (r) => r.max_grade ?? "—"]
    ],
    classes: [
        ["Клас", (r) => r.name],
        ["Навч. рік", (r) => r.school_year],
        ["Учнів", (r) => r.students_count],
        ["Оцінок", (r) => r.grades_count],
        ["Середній бал", (r) => num(r.avg_grade)],
        ["Мін.", (r) => r.min_grade ?? "—"],
        ["Макс.", (r) => r.max_grade ?? "—"]
    ],
    subjects: [
        ["Предмет", (r) => r.name],
        ["Вчитель", (r) => r.teacher_name?.trim() || "—"],
        ["Учнів вивчає", (r) => r.students_count],
        ["Оцінок", (r) => r.grades_count],
        ["Середній бал", (r) => num(r.avg_grade)],
        ["Мін.", (r) => r.min_grade ?? "—"],
        ["Макс.", (r) => r.max_grade ?? "—"],
        ["Незадовільних", (r) => r.low_count]
    ],
    low: [
        ["Дата", (r) => dayjs(r.created_at).format("DD.MM.YYYY")],
        ["Учень", fullName],
        ["Клас", (r) => r.class_name || "—"],
        ["Предмет", (r) => r.subject_name],
        ["Оцінка", (r) => r.grade]
    ],
    above: [
        ["Учень", fullName],
        ["Клас", (r) => r.class_name],
        ["Середній бал учня", (r) => num(r.avg_grade)],
        ["Середній бал класу", (r) => num(r.class_avg)]
    ],
    attendance: [
        ["Клас", (r) => r.name],
        ["Відміток", (r) => r.records],
        ["Присутні", (r) => r.present],
        ["Запізнення", (r) => r.late],
        ["Відсутні", (r) => r.absent],
        ["Відвідуваність, %", (r) => num(r.attendance_pct, 1)]
    ]
};

const PERFORMANCE_COLUMNS = [
    ["Клас", (r) => r.class_name],
    ["Оцінок", (r) => r.grades_count],
    ["Середній бал", (r) => num(r.avg_grade)],
    ["Високий (10–12)", (r) => r.high],
    ["Достатній (7–9)", (r) => r.sufficient],
    ["Середній (4–6)", (r) => r.middle],
    ["Початковий (1–3)", (r) => r.initial]
];

function ReportTable({ columns, rows, emptyText }) {

    if (rows.length === 0) {
        return <div className="dp-empty">{emptyText || "Немає даних"}</div>;
    }

    return (
        <div className="dp-table-wrap">
            <table className="dp-table">
                <thead>
                    <tr>
                        {columns.map(([title]) => <th key={title}>{title}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i}>
                            {columns.map(([title, get]) => <td key={title}>{get(row)}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

}

function exportCsv(columns, rows, name) {

    if (rows.length === 0) {
        toast.error("Немає даних для експорту");
        return;
    }

    const lines = [
        columns.map(([title]) => title),
        ...rows.map((row) => columns.map(([, get]) => get(row)))
    ];

    const csv = lines
        .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";"))
        .join("\n");

    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${name}_${dayjs().format("YYYY-MM-DD")}.csv`;
    link.click();

    URL.revokeObjectURL(url);

}

function Reports() {

    const [tab, setTab] = useState("rating");
    const [summary, setSummary] = useState(null);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);

    // Фільтри рейтингу
    const [classId, setClassId] = useState("");
    const [subjectId, setSubjectId] = useState("");

    // Успішність з окремого предмета
    const [perfSubjectId, setPerfSubjectId] = useState("");
    const [performance, setPerformance] = useState([]);

    // Період для відвідуваності
    const [from, setFrom] = useState(dayjs().startOf("month").format("YYYY-MM-DD"));
    const [to, setTo] = useState(dayjs().format("YYYY-MM-DD"));

    useEffect(() => {

        Promise.all([getReportSummary(), getClasses(), getSubjects()])
            .then(([summaryRes, classesRes, subjectsRes]) => {
                setSummary(summaryRes.data.data);
                setClasses(classesRes.data.classes || []);
                setSubjects(subjectsRes.data.subjects || []);
            })
            .catch(() => toast.error("Не вдалося завантажити звіти"));

    }, []);

    useEffect(() => {

        const loaders = {
            rating: () => getStudentAverages({
                class_id: classId || undefined,
                subject_id: subjectId || undefined
            }),
            classes: getClassAverages,
            subjects: getSubjectStats,
            low: getUnsatisfactory,
            above: getAboveClassAverage,
            attendance: () => getAttendanceReport({ from, to })
        };

        setLoading(true);

        loaders[tab]()
            .then((res) => setRows(res.data.data || []))
            .catch((error) => {
                setRows([]);
                toast.error(error.response?.data?.message || "Не вдалося сформувати звіт");
            })
            .finally(() => setLoading(false));

    }, [tab, classId, subjectId, from, to]);

    useEffect(() => {

        if (!perfSubjectId) {
            setPerformance([]);
            return;
        }

        getSubjectPerformance(perfSubjectId)
            .then((res) => setPerformance(res.data.data || []))
            .catch(() => toast.error("Не вдалося завантажити успішність з предмета"));

    }, [perfSubjectId]);

    const cards = summary ? [
        ["Учнів", summary.students_count],
        ["Вчителів", summary.teachers_count],
        ["Класів", summary.classes_count],
        ["Предметів", summary.subjects_count],
        ["Оцінок", summary.grades_count],
        ["Середній бал", num(summary.avg_grade)],
        ["Незадовільних оцінок", summary.low_grades_count]
    ] : [];

    return (
        <div className="dp-page">

            <div className="dp-header">
                <div>
                    <h1>Звіти та статистика</h1>
                    <div className="dp-header-sub">
                        Формуються SQL-запитами до бази даних на сервері
                    </div>
                </div>

                <button
                    className="dp-btn dp-btn-secondary"
                    onClick={() => exportCsv(COLUMNS[tab], rows, `report_${tab}`)}
                >
                    <FaDownload /> Експорт CSV
                </button>
            </div>

            <div className="rp-cards">
                {cards.map(([label, value]) => (
                    <div className="rp-card" key={label}>
                        <div className="rp-card-value">{value}</div>
                        <div className="rp-card-label">{label}</div>
                    </div>
                ))}
            </div>

            <div className="rp-tabs">
                {TABS.map((t) => (
                    <button
                        key={t.id}
                        type="button"
                        className={`rp-tab ${tab === t.id ? "active" : ""}`}
                        onClick={() => setTab(t.id)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === "rating" && (
                <div className="rp-filters">
                    <select value={classId} onChange={(e) => setClassId(e.target.value)}>
                        <option value="">Усі класи</option>
                        {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                        <option value="">Усі предмети</option>
                        {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
            )}

            {tab === "attendance" && (
                <div className="rp-filters">
                    <label>З <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
                    <label>По <input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label>
                </div>
            )}

            <div className="dp-card">
                {loading
                    ? <div className="dp-loading">Завантаження...</div>
                    : <ReportTable
                        columns={COLUMNS[tab]}
                        rows={rows}
                        emptyText={tab === "low" ? "Незадовільних оцінок немає" : undefined}
                    />}
            </div>

            {tab === "subjects" && (
                <div className="rp-section">
                    <div className="rp-section-head">
                        <h2>Успішність з предмета за класами</h2>
                        <select value={perfSubjectId} onChange={(e) => setPerfSubjectId(e.target.value)}>
                            <option value="">Оберіть предмет</option>
                            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    {perfSubjectId && (
                        <div className="dp-card">
                            <ReportTable columns={PERFORMANCE_COLUMNS} rows={performance} />
                        </div>
                    )}
                </div>
            )}

        </div>
    );

}

export default Reports;
