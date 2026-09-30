import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import _ from "lodash";
import { toast } from "react-toastify";
import { FaTimes, FaDownload, FaPlus } from "react-icons/fa";

import { getStudents } from "../../services/studentService";
import { getClasses } from "../../services/classService";
import { getSubjects } from "../../services/subjectService";
import Avatar from "../../components/Avatar";
import {
  getGrades,
  createGrade,
  updateGrade,
} from "../../services/gradeService";
import { getAttendance } from "../../services/attendanceService";

import { getGradeColor, getAttendanceColor } from "../../utils/gradeColors";

import "../../styles/DataPage.css";
import "./Journal.css";

const weekdayAbbrev = ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

const monthNames = [
  "Січень",
  "Лютий",
  "Березень",
  "Квітень",
  "Травень",
  "Червень",
  "Липень",
  "Серпень",
  "Вересень",
  "Жовтень",
  "Листопад",
  "Грудень",
];

function buildMonthOptions() {
  const options = [];

  for (let i = -10; i <= 2; i++) {
    const date = dayjs().add(i, "month");

    options.push({
      value: date.format("YYYY-MM"),
      label: `${monthNames[date.month()]} ${date.year()}`,
    });
  }

  return options;
}

const emptyGradeForm = {
  student_id: "",
  subject_id: "",
  grade: "",
  comment: "",
  date: dayjs().format("YYYY-MM-DD"),
};

function Journal() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  const monthOptions = useMemo(buildMonthOptions, []);

  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [month, setMonth] = useState(dayjs().format("YYYY-MM"));

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyGradeForm);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);

    try {
      const [studentsRes, classesRes, subjectsRes, gradesRes, attendanceRes] =
        await Promise.all([
          getStudents(),
          getClasses(),
          getSubjects(),
          getGrades(),
          getAttendance(),
        ]);

      const loadedClasses = classesRes.data.classes || [];
      const loadedSubjects = subjectsRes.data.subjects || [];

      setStudents(studentsRes.data.students || []);
      setClasses(loadedClasses);
      setSubjects(loadedSubjects);
      setGrades(gradesRes.data.grades || []);
      setAttendance(attendanceRes.data.attendance || []);

      if (!classId && loadedClasses.length > 0) {
        setClassId(String(loadedClasses[0].id));
      }

      if (!subjectId && loadedSubjects.length > 0) {
        setSubjectId(String(loadedSubjects[0].id));
      }
    } catch (error) {
      console.error(error);
      toast.error("Не вдалося завантажити журнал");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const classStudents = useMemo(() => {
    return students.filter((s) => String(s.class_id) === String(classId));
  }, [students, classId]);

  const classStudentIds = useMemo(
    () => new Set(classStudents.map((s) => s.id)),
    [classStudents],
  );

  const filteredGrades = useMemo(() => {
    return grades.filter(
      (g) =>
        classStudentIds.has(g.student_id) &&
        String(g.subject_id) === String(subjectId) &&
        dayjs(g.created_at).format("YYYY-MM") === month,
    );
  }, [grades, classStudentIds, subjectId, month]);

  const filteredAttendance = useMemo(() => {
    return attendance.filter(
      (a) =>
        classStudentIds.has(a.student_id) &&
        dayjs(a.lesson_date).format("YYYY-MM") === month,
    );
  }, [attendance, classStudentIds, month]);

  const dateColumns = useMemo(() => {
    const uniqueDates = _.uniq(
      filteredGrades.map((g) => dayjs(g.created_at).format("YYYY-MM-DD")),
    );

    return uniqueDates.sort();
  }, [filteredGrades]);

  const findGrade = (studentId, date) =>
    filteredGrades.find(
      (g) =>
        g.student_id === studentId &&
        dayjs(g.created_at).format("YYYY-MM-DD") === date,
    );

  const getStudentAverage = (studentId) => {
    const values = filteredGrades
      .filter((g) => g.student_id === studentId)
      .map((g) => g.grade);

    if (values.length === 0) {
      return null;
    }

    return Math.round(_.mean(values) * 10) / 10;
  };

  const getStudentAttendance = (studentId) => {
    const records = filteredAttendance.filter(
      (a) => a.student_id === studentId,
    );

    if (records.length === 0) {
      return null;
    }

    const score = records.reduce((sum, r) => {
      if (r.status === "present") return sum + 1;
      if (r.status === "late") return sum + 0.5;
      return sum;
    }, 0);

    return Math.round((score / records.length) * 100);
  };

  const openAddModal = () => {
    setEditingId(null);

    setForm({
      ...emptyGradeForm,
      subject_id: subjectId,
    });

    setShowModal(true);
  };

  const openEditModal = (gradeRecord) => {
    setEditingId(gradeRecord.id);

    setForm({
      student_id: gradeRecord.student_id,
      subject_id: gradeRecord.subject_id,
      grade: String(gradeRecord.grade),
      comment: gradeRecord.comment || "",
      date: dayjs(gradeRecord.created_at).format("YYYY-MM-DD"),
    });

    setShowModal(true);
  };

  const openQuickAdd = (studentId, date) => {
    setEditingId(null);

    setForm({
      student_id: studentId,
      subject_id: subjectId,
      grade: "",
      comment: "",
      date,
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

    if (!form.student_id || !form.subject_id || !form.grade) {
      toast.error("Заповніть усі обов'язкові поля");
      return;
    }

    const gradeNum = Number(form.grade);

    if (gradeNum < 1 || gradeNum > 12) {
      toast.error("Оцінка має бути від 1 до 12");
      return;
    }

    const subjectRecord = subjects.find(
      (s) => String(s.id) === String(form.subject_id),
    );

    const teacherId = subjectRecord?.teacher_id;

    if (!teacherId) {
      toast.error(
        "У предмета немає прив'язаного вчителя — оцінку не можна виставити",
      );
      return;
    }

    setSaving(true);

    try {
      const payload = {
        student_id: Number(form.student_id),
        subject_id: Number(form.subject_id),
        teacher_id: Number(teacherId),
        grade: gradeNum,
        comment: form.comment,
        created_at: form.date,
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
        error.response?.data?.message || "Не вдалося зберегти оцінку",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    if (classStudents.length === 0) {
      toast.error("Немає даних для експорту");
      return;
    }

    const header = [
      "Учень",
      ...dateColumns,
      "Середній бал",
      "Відвідуваність %",
    ];

    const rows = classStudents.map((student) => {
      const fullName = `${student.first_name} ${student.last_name}`;

      const gradeValues = dateColumns.map((date) => {
        const record = findGrade(student.id, date);
        return record ? record.grade : "";
      });

      const avg = getStudentAverage(student.id);
      const att = getStudentAttendance(student.id);

      return [fullName, ...gradeValues, avg ?? "", att ?? ""];
    });

    const csvContent = [header, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(";"))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `journal_${month}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="dp-page">
      <div className="jr-header">
        <h1>Журнал оцінок</h1>

        <div className="jr-header-actions">
          <button className="dp-btn dp-btn-secondary" onClick={handleExport}>
            <FaDownload /> Експорт
          </button>

          <button className="dp-btn dp-btn-primary" onClick={openAddModal}>
            <FaPlus /> Додати оцінку
          </button>
        </div>
      </div>

      <div className="jr-filters">
        <div className="jr-filter-group">
          <label>Клас</label>
          <select value={classId} onChange={(e) => setClassId(e.target.value)}>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="jr-filter-group">
          <label>Предмет</label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="jr-filter-group">
          <label>Місяць</label>
          <select value={month} onChange={(e) => setMonth(e.target.value)}>
            {monthOptions.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="dp-card">
        <div className="dp-table-wrap">
          {loading ? (
            <div className="dp-loading">Завантаження...</div>
          ) : classStudents.length === 0 ? (
            <div className="dp-empty">У цьому класі немає учнів</div>
          ) : (
            <table className="jr-table">
              <thead>
                <tr>
                  <th className="jr-student-col">Учні</th>
                  {dateColumns.map((date) => (
                    <th key={date} className="jr-date-col">
                      <div>{dayjs(date).format("DD")}</div>
                      <div className="jr-date-weekday">
                        {weekdayAbbrev[dayjs(date).day()]}
                      </div>
                    </th>
                  ))}
                  <th>Середній бал</th>
                  <th>Відвідуваність</th>
                </tr>
              </thead>

              <tbody>
                {classStudents.map((student) => {
                  const avg = getStudentAverage(student.id);
                  const att = getStudentAttendance(student.id);

                  return (
                    <tr key={student.id}>
                      <td className="jr-student-cell">
                        <Avatar
                          photoUrl={student.photo_url}
                          firstName={student.first_name}
                          lastName={student.last_name}
                          size={34}
                        />
                        <span>
                          {student.first_name} {student.last_name}
                        </span>
                      </td>

                      {dateColumns.map((date) => {
                        const record = findGrade(student.id, date);
                        const color = getGradeColor(record?.grade);

                        return (
                          <td key={date} className="jr-grade-col">
                            <button
                              type="button"
                              className="jr-grade-pill"
                              style={{
                                background: color.bg,
                                color: color.text,
                              }}
                              onClick={() =>
                                record
                                  ? openEditModal(record)
                                  : openQuickAdd(student.id, date)
                              }
                            >
                              {record ? record.grade : "–"}
                            </button>
                          </td>
                        );
                      })}

                      <td className="jr-avg-cell">{avg ?? "—"}</td>

                      <td className="jr-att-cell">
                        {att !== null ? (
                          <>
                            <div className="jr-att-percent">{att}%</div>
                            <div className="jr-att-bar-track">
                              <div
                                className="jr-att-bar-fill"
                                style={{
                                  width: `${att}%`,
                                  background: getAttendanceColor(att),
                                }}
                              />
                            </div>
                          </>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="dp-modal-backdrop" onClick={closeModal}>
          <div className="dp-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? "Редагувати оцінку" : "Нова оцінка"}</h2>

            <form onSubmit={handleSubmit}>
              <div className="dp-form-group">
                <label>Учень</label>
                <select
                  name="student_id"
                  value={form.student_id}
                  onChange={handleChange}
                >
                  <option value="">Оберіть учня</option>
                  {classStudents.map((s) => (
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

              <div className="dp-form-grid">
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
                  <label>Дата</label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                  />
                </div>
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

export default Journal;
