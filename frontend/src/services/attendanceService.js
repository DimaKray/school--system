import api from "../api/api";

export const getAttendance = () => api.get("/attendance");
export const createAttendance = (data) => api.post("/attendance", data);
export const updateAttendance = (id, data) => api.put(`/attendance/${id}`, data);
export const deleteAttendance = (id) => api.delete(`/attendance/${id}`);
// Збереження відміток усього класу за день
export const saveAttendanceBulk = (lesson_date, records) =>
    api.post("/attendance/bulk", { lesson_date, records });
