import api from "../api/api";

export const getTeachers = () => api.get("/teachers");
export const createTeacher = (data) => api.post("/teachers", data);
export const updateTeacher = (id, data) => api.put(`/teachers/${id}`, data);
export const deleteTeacher = (id) => api.delete(`/teachers/${id}`);
