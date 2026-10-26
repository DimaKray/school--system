import api from "../api/api";

export const getReportSummary = () => api.get("/reports/summary");
export const getStudentAverages = (params) => api.get("/reports/students", { params });
export const getClassAverages = () => api.get("/reports/classes");
export const getSubjectStats = () => api.get("/reports/subjects");
export const getSubjectPerformance = (id) => api.get(`/reports/subjects/${id}`);
export const getUnsatisfactory = () => api.get("/reports/unsatisfactory");
export const getAboveClassAverage = () => api.get("/reports/above-average");
export const getAttendanceReport = (params) => api.get("/reports/attendance", { params });
