import api from "../api/api";

export const getClasses = () => api.get("/classes");
export const createClass = (data) => api.post("/classes", data);
export const updateClass = (id, data) => api.put(`/classes/${id}`, data);
export const deleteClass = (id) => api.delete(`/classes/${id}`);
