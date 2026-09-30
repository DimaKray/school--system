import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import _ from "lodash";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { FaExclamationTriangle } from "react-icons/fa";

import { getGrades } from "../../services/gradeService";
import { getAttendance } from "../../services/attendanceService";
import { getStudents } from "../../services/studentService";
import { getSubjects } from "../../services/subjectService";

import Avatar from "../../components/Avatar";

import "../../styles/DataPage.css";
import "./Analytics.css";

const monthNames = [
    "Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень",
    "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"
];

function buildMonthOptions() {

    const options = [];

    for (let i = -10; i <= 2; i++) {

        const date = dayjs().add(i, "month");

        options.push({
            value: date.format("YYYY-MM"),
            label: `${monthNames[date.month()]} ${date.year()}`
        });

    }

    return options;

}

const SUBJECT_COLORS = ["#7367F0", "#3B8FE0", "#E0A020", "#2FB380", "#E0568C", "#0E7C6B"];

const ATTENDANCE_COLORS = {
    present: "#7367F0",
    late: "#E0A020",
    absent: "#E34848"
};

const GRADE_BUCKET_COLORS = {
    high: "#7367F0",
    good: "#3B8FE0",
    mid: "#2FB380",
    low: "#E34848"
};

function Analytics() {

    const navigate = useNavigate();

    const monthOptions = useMemo(buildMonthOptions, []);
    const [month, setMonth] = useState(dayjs().format("YYYY-MM"));

    const [grades, setGrades] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const loadData = async () => {

            setLoading(true);

            try {

                const [gradesRes, attendanceRes, studentsRes, subjectsRes] =
                    await Promise.all([
                        getGrades(),
                        getAttendance(),
                        getStudents(),
                        getSubjects()
                    ]);

                setGrades(gradesRes.data.grades || []);
                setAttendance(attendanceRes.data.attendance || []);
                setStudents(studentsRes.data.students || []);
                setSubjects(subjectsRes.data.subjects || []);

            } catch (error) {

                console.error(error);
                toast.error("Не вдалося завантажити аналітику");

            } finally {

                setLoading(false);

            }

        };

        loadData();

    }, []);

    const monthGrades = useMemo(() => {

        return grades.filter(
            (g) => dayjs(g.created_at).format("YYYY-MM") === month
        );

    }, [grades, month]);

    const prevMonthGrades = useMemo(() => {

        const prev = dayjs(`${month}-01`).subtract(1, "month").format("YYYY-MM");

        return grades.filter(
            (g) => dayjs(g.created_at).format("YYYY-MM") === prev
        );

    }, [grades, month]);

    const monthAttendance = useMemo(() => {

        return attendance.filter(
            (a) => dayjs(a.lesson_date).format("YYYY-MM") === month
        );

    }, [attendance, month]);

    const prevMonthAttendance = useMemo(() => {

        const prev = dayjs(`${month}-01`).subtract(1, "month").format("YYYY-MM");

        return attendance.filter(
            (a) => dayjs(a.lesson_date).format("YYYY-MM") === prev
        );

    }, [attendance, month]);

    // ===== Середній бал + тренд =====

    const overallAverage = monthGrades.length > 0
        ? Math.round(_.meanBy(monthGrades, "grade") * 10) / 10
        : null;

    const prevAverage = prevMonthGrades.length > 0
        ? Math.round(_.meanBy(prevMonthGrades, "grade") * 10) / 10
        : null;

    const averageDelta = overallAverage !== null && prevAverage !== null
        ? Math.round((overallAverage - prevAverage) * 10) / 10
        : null;

    const weeklyTrend = useMemo(() => {

        const weeks = [1, 2, 3, 4, 5].map((weekNum) => {

            const weekGrades = monthGrades.filter((g) => {
                const day = dayjs(g.created_at).date();
                return Math.ceil(day / 7) === weekNum;
            });

            return {
                label: `${weekNum} тиждень`,
                value: weekGrades.length > 0
                    ? Math.round(_.meanBy(weekGrades, "grade") * 10) / 10
                    : null
            };

        });

        return weeks.filter((w, index) =>
            w.value !== null || index < weeks.findLastIndex((x) => x.value !== null) + 1
        );

    }, [monthGrades]);

    // ===== Успішність по предметах =====

    const subjectSuccess = useMemo(() => {

        const grouped = _.groupBy(monthGrades, "subject_id");

        return subjects
            .map((subject) => {

                const subjectGrades = grouped[subject.id] || [];

                if (subjectGrades.length === 0) {
                    return null;
                }

                const avg = _.meanBy(subjectGrades, "grade");

                return {
                    name: subject.name,
                    value: Math.round((avg / 12) * 100)
                };

            })
            .filter(Boolean);

    }, [monthGrades, subjects]);

    // ===== Топ і проблемні учні =====

    const studentAverages = useMemo(() => {

        const grouped = _.groupBy(monthGrades, "student_id");

        return Object.keys(grouped).map((studentId) => {

            const student = students.find((s) => String(s.id) === studentId);

            if (!student) {
                return null;
            }

            return {
                id: student.id,
                first_name: student.first_name,
                last_name: student.last_name,
                photo_url: student.photo_url,
                average: Math.round(_.meanBy(grouped[studentId], "grade") * 10) / 10
            };

        }).filter(Boolean);

    }, [monthGrades, students]);

    const topStudents = useMemo(
        () => _.orderBy(studentAverages, ["average"], ["desc"]).slice(0, 5),
        [studentAverages]
    );

    const problemStudents = useMemo(
        () => _.orderBy(
            studentAverages.filter((s) => s.average < 8),
            ["average"],
            ["asc"]
        ).slice(0, 5),
        [studentAverages]
    );

    // ===== Відвідуваність =====

    const attendanceStats = useMemo(() => {

        if (monthAttendance.length === 0) {
            return null;
        }

        const total = monthAttendance.length;
        const present = monthAttendance.filter((a) => a.status === "present").length;
        const late = monthAttendance.filter((a) => a.status === "late").length;
        const absent = monthAttendance.filter((a) => a.status === "absent").length;

        return {
            presentPct: Math.round((present / total) * 100),
            latePct: Math.round((late / total) * 100),
            absentPct: Math.round((absent / total) * 100)
        };

    }, [monthAttendance]);

    const prevAttendancePct = useMemo(() => {

        if (prevMonthAttendance.length === 0) {
            return null;
        }

        const present = prevMonthAttendance.filter((a) => a.status === "present").length;

        return Math.round((present / prevMonthAttendance.length) * 100);

    }, [prevMonthAttendance]);

    const attendanceDelta = attendanceStats && prevAttendancePct !== null
        ? attendanceStats.presentPct - prevAttendancePct
        : null;

    const attendanceChartData = attendanceStats ? [
        { name: "Присутні", value: attendanceStats.presentPct, color: ATTENDANCE_COLORS.present },
        { name: "Відсутні", value: attendanceStats.absentPct, color: ATTENDANCE_COLORS.absent },
        { name: "Запізнення", value: attendanceStats.latePct, color: ATTENDANCE_COLORS.late }
    ] : [];

    // ===== Розподіл оцінок =====

    const gradeDistribution = useMemo(() => {

        if (monthGrades.length === 0) {
            return [];
        }

        const total = monthGrades.length;

        const buckets = {
            high: monthGrades.filter((g) => g.grade >= 9).length,
            good: monthGrades.filter((g) => g.grade >= 7 && g.grade <= 8).length,
            mid: monthGrades.filter((g) => g.grade >= 4 && g.grade <= 6).length,
            low: monthGrades.filter((g) => g.grade >= 1 && g.grade <= 3).length
        };

        return [
            { name: "9-12 балів", value: Math.round((buckets.high / total) * 100), color: GRADE_BUCKET_COLORS.high },
            { name: "7-8 балів", value: Math.round((buckets.good / total) * 100), color: GRADE_BUCKET_COLORS.good },
            { name: "4-6 балів", value: Math.round((buckets.mid / total) * 100), color: GRADE_BUCKET_COLORS.mid },
            { name: "1-3 бали", value: Math.round((buckets.low / total) * 100), color: GRADE_BUCKET_COLORS.low }
        ];

    }, [monthGrades]);

    return (
        <div className="dp-page">

            <div className="an-header">

                <h1>Аналітика</h1>

                <select
                    className="an-month-select"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                >
                    {monthOptions.map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                </select>

            </div>

            {loading ? (

                <div className="dp-loading">Завантаження...</div>

            ) : (

                <>

                    <div className="an-grid">

                        <div className="an-card">

                            <h2>Середній бал</h2>

                            <div className="an-value">{overallAverage ?? "—"}</div>

                            {averageDelta !== null && (
                                <div className={`an-delta ${averageDelta >= 0 ? "up" : "down"}`}>
                                    {averageDelta >= 0 ? "↑" : "↓"} {Math.abs(averageDelta)}
                                    <span>Порівняно з минулим місяцем</span>
                                </div>
                            )}

                            <ResponsiveContainer width="100%" height={130}>
                                <LineChart data={weeklyTrend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" />
                                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#999" }} axisLine={false} tickLine={false} />
                                    <YAxis domain={[0, 12]} tick={{ fontSize: 10, fill: "#999" }} axisLine={false} tickLine={false} width={20} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="value" stroke="#7367F0" strokeWidth={2.5} dot={{ r: 3, fill: "#7367F0" }} connectNulls />
                                </LineChart>
                            </ResponsiveContainer>

                        </div>

                        <div className="an-card">

                            <h2>Успішність по предметах</h2>

                            {subjectSuccess.length === 0 ? (

                                <div className="dp-empty">Немає даних за цей місяць</div>

                            ) : (

                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={subjectSuccess}>
                                        <XAxis
                                            dataKey="name"
                                            tick={{ fontSize: 10, fill: "#999" }}
                                            axisLine={false}
                                            tickLine={false}
                                            interval={0}
                                        />
                                        <YAxis hide domain={[0, 100]} />
                                        <Tooltip formatter={(v) => `${v}%`} />
                                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                            {subjectSuccess.map((entry, index) => (
                                                <Cell
                                                    key={entry.name}
                                                    fill={SUBJECT_COLORS[index % SUBJECT_COLORS.length]}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>

                            )}

                        </div>

                        <div className="an-card">

                            <h2>Топ учнів</h2>

                            {topStudents.length === 0 ? (

                                <div className="dp-empty">Немає даних</div>

                            ) : (

                                <div className="an-list">
                                    {topStudents.map((s, index) => (
                                        <div className="an-list-item" key={s.id}>
                                            <div className="an-rank">{index + 1}.</div>
                                            <Avatar photoUrl={s.photo_url} firstName={s.first_name} lastName={s.last_name} size={28} />
                                            <div className="an-name">{s.first_name} {s.last_name}</div>
                                            <div className="an-score good">{s.average}</div>
                                        </div>
                                    ))}
                                </div>

                            )}

                            <button className="dash-link-btn" onClick={() => navigate("/students")}>
                                Усі учні
                            </button>

                        </div>

                    </div>

                    <div className="an-grid">

                        <div className="an-card">

                            <h2>Відвідуваність</h2>

                            {!attendanceStats ? (

                                <div className="dp-empty">Немає даних за цей місяць</div>

                            ) : (

                                <>

                                    <div className="an-value">{attendanceStats.presentPct}%</div>

                                    {attendanceDelta !== null && (
                                        <div className={`an-delta ${attendanceDelta >= 0 ? "up" : "down"}`}>
                                            {attendanceDelta >= 0 ? "↑" : "↓"} {Math.abs(attendanceDelta)}%
                                            <span>Порівняно з минулим місяцем</span>
                                        </div>
                                    )}

                                    <div className="an-donut-row">

                                        <ResponsiveContainer width={130} height={130}>
                                            <PieChart>
                                                <Pie
                                                    data={attendanceChartData}
                                                    dataKey="value"
                                                    innerRadius={38}
                                                    outerRadius={60}
                                                    paddingAngle={2}
                                                >
                                                    {attendanceChartData.map((entry) => (
                                                        <Cell key={entry.name} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(v) => `${v}%`} />
                                            </PieChart>
                                        </ResponsiveContainer>

                                        <div className="an-legend">
                                            {attendanceChartData.map((entry) => (
                                                <div className="an-legend-item" key={entry.name}>
                                                    <span className="an-legend-dot" style={{ background: entry.color }} />
                                                    {entry.name}
                                                    <span className="an-legend-value">{entry.value}%</span>
                                                </div>
                                            ))}
                                        </div>

                                    </div>

                                </>

                            )}

                        </div>

                        <div className="an-card">

                            <h2>Розподіл оцінок</h2>

                            {gradeDistribution.length === 0 ? (

                                <div className="dp-empty">Немає даних за цей місяць</div>

                            ) : (

                                <div className="an-donut-row">

                                    <ResponsiveContainer width={130} height={130}>
                                        <PieChart>
                                            <Pie
                                                data={gradeDistribution}
                                                dataKey="value"
                                                innerRadius={38}
                                                outerRadius={60}
                                                paddingAngle={2}
                                            >
                                                {gradeDistribution.map((entry) => (
                                                    <Cell key={entry.name} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(v) => `${v}%`} />
                                        </PieChart>
                                    </ResponsiveContainer>

                                    <div className="an-legend">
                                        {gradeDistribution.map((entry) => (
                                            <div className="an-legend-item" key={entry.name}>
                                                <span className="an-legend-dot" style={{ background: entry.color }} />
                                                {entry.name}
                                                <span className="an-legend-value">{entry.value}%</span>
                                            </div>
                                        ))}
                                    </div>

                                </div>

                            )}

                        </div>

                        <div className="an-card">

                            <h2>Проблемні учні</h2>

                            {problemStudents.length === 0 ? (

                                <div className="dp-empty">Проблемних учнів не виявлено</div>

                            ) : (

                                <div className="an-list">
                                    {problemStudents.map((s) => (
                                        <div className="an-list-item" key={s.id}>
                                            <FaExclamationTriangle className="an-warning-icon" />
                                            <Avatar photoUrl={s.photo_url} firstName={s.first_name} lastName={s.last_name} size={28} />
                                            <div className="an-name">{s.first_name} {s.last_name}</div>
                                            <div className="an-score bad">{s.average}</div>
                                        </div>
                                    ))}
                                </div>

                            )}

                            <button className="dash-link-btn" onClick={() => navigate("/students")}>
                                Усі учні
                            </button>

                        </div>

                    </div>

                </>

            )}

        </div>
    );

}

export default Analytics;