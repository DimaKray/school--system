import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import _ from "lodash";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import {
    FaSchool, FaUserGraduate, FaChalkboardTeacher, FaChartLine,
    FaPlus, FaCalendarPlus, FaDownload
} from "react-icons/fa";
import { toast } from "react-toastify";

import { AuthContext } from "../../context/AuthContext";

import { getStudents } from "../../services/studentService";
import { getTeachers } from "../../services/teacherService";
import { getClasses } from "../../services/classService";
import { getSchedule } from "../../services/scheduleService";
import { getGrades } from "../../services/gradeService";

import Avatar from "../../components/Avatar";
import { getLessonTime } from "../../utils/lessonTimes";

import "./Dashboard.css";

function Dashboard() {

    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [classes, setClasses] = useState([]);
    const [schedule, setSchedule] = useState([]);
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const loadData = async () => {

            try {

                const [
                    studentsRes,
                    teachersRes,
                    classesRes,
                    scheduleRes,
                    gradesRes
                ] = await Promise.all([
                    getStudents(),
                    getTeachers(),
                    getClasses(),
                    getSchedule(),
                    getGrades()
                ]);

                setStudents(studentsRes.data.students || []);
                setTeachers(teachersRes.data.teachers || []);
                setClasses(classesRes.data.classes || []);
                setSchedule(scheduleRes.data.schedule || []);
                setGrades(gradesRes.data.grades || []);

            } catch (error) {

                console.error(error);
                toast.error("Не вдалося завантажити дані дашборду");

            } finally {

                setLoading(false);

            }

        };

        loadData();

    }, []);

    const overallAverage = useMemo(() => {

        if (grades.length === 0) {
            return null;
        }

        return Math.round(_.meanBy(grades, "grade") * 10) / 10;

    }, [grades]);

    const todaySchedule = useMemo(() => {

        const todayWeekday = dayjs().day() === 0 ? 7 : dayjs().day();

        return schedule
            .filter((s) => s.weekday === todayWeekday)
            .sort((a, b) => a.lesson_number - b.lesson_number)
            .slice(0, 4);

    }, [schedule]);

    const weeklyTrend = useMemo(() => {

        const weeks = [];

        for (let i = 4; i >= 0; i--) {

            const start = dayjs().subtract(i, "week").startOf("day").subtract(6, "day");
            const end = dayjs().subtract((i - 1), "week").startOf("day");

            const weekGrades = grades.filter((g) => {
                const date = dayjs(g.created_at);
                return date.isAfter(start) && date.isBefore(end);
            });

            weeks.push({
                label: `${5 - i} тиждень`,
                value: weekGrades.length > 0
                    ? Math.round(_.meanBy(weekGrades, "grade") * 10) / 10
                    : null
            });

        }

        return weeks;

    }, [grades]);

    const previousAverage = useMemo(() => {

        const values = weeklyTrend
            .slice(0, weeklyTrend.length - 1)
            .map((w) => w.value)
            .filter((v) => v !== null);

        if (values.length === 0) {
            return null;
        }

        return Math.round(_.mean(values) * 10) / 10;

    }, [weeklyTrend]);

    const averageDelta = overallAverage !== null && previousAverage !== null
        ? Math.round((overallAverage - previousAverage) * 10) / 10
        : null;

    const topStudents = useMemo(() => {

        const grouped = _.groupBy(grades, "student_id");

        const list = Object.keys(grouped).map((studentId) => {

            const studentGrades = grouped[studentId];
            const student = students.find((s) => String(s.id) === studentId);

            if (!student) {
                return null;
            }

            return {
                id: student.id,
                first_name: student.first_name,
                last_name: student.last_name,
                photo_url: student.photo_url,
                average: Math.round(_.meanBy(studentGrades, "grade") * 10) / 10
            };

        }).filter(Boolean);

        return _.orderBy(list, ["average"], ["desc"]).slice(0, 5);

    }, [grades, students]);

    const handleExport = () => {

        if (grades.length === 0) {
            toast.error("Немає даних для експорту");
            return;
        }

        const header = ["Учень", "Предмет", "Вчитель", "Оцінка", "Дата"];

        const rows = grades.map((g) => [
            `${g.student_first_name} ${g.student_last_name}`,
            g.subject_name,
            `${g.teacher_first_name} ${g.teacher_last_name}`,
            g.grade,
            dayjs(g.created_at).format("YYYY-MM-DD")
        ]);

        const csvContent = [header, ...rows]
            .map((row) => row.map((cell) => `"${cell}"`).join(";"))
            .join("\n");

        const blob = new Blob(["\uFEFF" + csvContent], {
            type: "text/csv;charset=utf-8;"
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `grades_export_${dayjs().format("YYYY-MM-DD")}.csv`;
        link.click();

        URL.revokeObjectURL(url);

    };

    const statCards = [
        {
            label: "Класи",
            value: classes.length,
            sub: "Активних класів",
            icon: <FaSchool />,
            color: "#7367F0",
            bg: "#EFECFE"
        },
        {
            label: "Учні",
            value: students.length,
            sub: "Загальна кількість",
            icon: <FaUserGraduate />,
            color: "#E0568C",
            bg: "#FCEAF1"
        },
        {
            label: "Вчителі",
            value: teachers.length,
            sub: "Викладачів у школі",
            icon: <FaChalkboardTeacher />,
            color: "#2FB380",
            bg: "#E4F7EE"
        },
        {
            label: "Середній бал",
            value: overallAverage ?? "—",
            sub: "Успішність учнів",
            icon: <FaChartLine />,
            color: "#3B8FE0",
            bg: "#E7F2FC"
        }
    ];

    const userName = user
        ? `${user.first_name} ${user.last_name}`
        : "";

    return (
        <div className="dash-content">

            <div className="dash-greeting">
                <h1>Вітаємо, {userName}! 👋</h1>
                <p>Ось що відбувається у вашій школі сьогодні.</p>
            </div>

            <div className="dash-stats">
                {statCards.map((card) => (
                    <div className="dash-stat-card" key={card.label}>

                        <div
                            className="dash-stat-icon"
                            style={{ background: card.bg, color: card.color }}
                        >
                            {card.icon}
                        </div>

                        <div className="dash-stat-label">{card.label}</div>
                        <div className="dash-stat-value">
                            {loading ? "…" : card.value}
                        </div>
                        <div className="dash-stat-sub">{card.sub}</div>

                    </div>
                ))}
            </div>

            <div className="dash-row">

                <div className="dash-card dash-schedule-card">

                    <h2>Розклад на сьогодні</h2>

                    {todaySchedule.length === 0 ? (

                        <div className="dash-empty">Сьогодні уроків немає</div>

                    ) : (

                        <div className="dash-lesson-list">
                            {todaySchedule.map((lesson) => (
                                <div className="dash-lesson-item" key={lesson.id}>

                                    <div className="dash-lesson-num">
                                        {lesson.lesson_number} урок
                                    </div>

                                    <div className="dash-lesson-info">
                                        <div className="dash-lesson-title">
                                            {lesson.subject_name} {lesson.class_name}
                                        </div>
                                    </div>

                                    <div className="dash-lesson-time">
                                        {getLessonTime(lesson.lesson_number)}
                                    </div>

                                </div>
                            ))}
                        </div>

                    )}

                    <button
                        className="dash-link-btn"
                        onClick={() => navigate("/schedule")}
                    >
                        Переглянути розклад
                    </button>

                </div>

                <div className="dash-card dash-chart-card">

                    <div className="dash-card-head">
                        <h2>Шкільна успішність</h2>
                        <div className="dash-pill">За місяць</div>
                    </div>

                    <div className="dash-chart-summary">

                        <div>
                            <div className="dash-chart-value">
                                {overallAverage ?? "—"}
                            </div>
                            <div className="dash-chart-label">Середній бал</div>
                        </div>

                        {averageDelta !== null && (
                            <div
                                className={`dash-delta ${averageDelta >= 0 ? "up" : "down"}`}
                            >
                                {averageDelta >= 0 ? "↑" : "↓"} {Math.abs(averageDelta)}
                                <span>Порівняно з минулим тижнем</span>
                            </div>
                        )}

                    </div>

                    <ResponsiveContainer width="100%" height={140}>
                        <LineChart data={weeklyTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" />
                            <XAxis
                                dataKey="label"
                                tick={{ fontSize: 11, fill: "#999" }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                domain={[0, 12]}
                                tick={{ fontSize: 11, fill: "#999" }}
                                axisLine={false}
                                tickLine={false}
                                width={22}
                            />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#7367F0"
                                strokeWidth={2.5}
                                dot={{ r: 4, fill: "#7367F0" }}
                                connectNulls
                            />
                        </LineChart>
                    </ResponsiveContainer>

                </div>

                <div className="dash-card dash-top-card">

                    <div className="dash-card-head">
                        <h2>Топ учнів</h2>
                        <div className="dash-pill">2025-2026</div>
                    </div>

                    {topStudents.length === 0 ? (

                        <div className="dash-empty">Немає даних про оцінки</div>

                    ) : (

                        <div className="dash-top-list">
                            {topStudents.map((s, index) => (
                                <div className="dash-top-item" key={s.id}>

                                    <div className="dash-top-rank">{index + 1}.</div>

                                    <Avatar
                                        photoUrl={s.photo_url}
                                        firstName={s.first_name}
                                        lastName={s.last_name}
                                        size={30}
                                    />

                                    <div className="dash-top-name">
                                        {s.first_name} {s.last_name}
                                    </div>

                                    <div className="dash-top-score">{s.average}</div>

                                </div>
                            ))}
                        </div>

                    )}

                    <button
                        className="dash-link-btn"
                        onClick={() => navigate("/students")}
                    >
                        Усі учні
                    </button>

                </div>

            </div>

            <div className="dash-card dash-actions-card">

                <h2>Швидкі дії</h2>

                <div className="dash-actions">

                    <button
                        className="dash-action-btn"
                        onClick={() => navigate("/journal")}
                    >
                        <div className="dash-action-icon purple"><FaPlus /></div>
                        <div>
                            <div className="dash-action-title">Додати оцінку</div>
                            <div className="dash-action-sub">Швидке внесення оцінки</div>
                        </div>
                    </button>

                    <button
                        className="dash-action-btn"
                        onClick={() => navigate("/homework")}
                    >
                        <div className="dash-action-icon yellow"><FaCalendarPlus /></div>
                        <div>
                            <div className="dash-action-title">Створити завдання</div>
                            <div className="dash-action-sub">Додати домашнє завдання</div>
                        </div>
                    </button>

                    <button
                        className="dash-action-btn"
                        onClick={handleExport}
                    >
                        <div className="dash-action-icon blue"><FaDownload /></div>
                        <div>
                            <div className="dash-action-title">Експорт даних</div>
                            <div className="dash-action-sub">Завантажити звіти</div>
                        </div>
                    </button>

                </div>

            </div>

        </div>
    );
}

export default Dashboard;