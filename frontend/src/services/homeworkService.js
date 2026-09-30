import api from "../api/api";

export const getHomework = () => api.get("/homework");
export const createHomework = (data) => api.post("/homework", data);
export const updateHomework = (id, data) => api.put(`/homework/${id}`, data);
export const deleteHomework = (id) => api.delete(`/homework/${id}`);
