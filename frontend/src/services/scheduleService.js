import api from "../api/api";

export const getSchedule = () => api.get("/schedule");
export const createSchedule = (data) => api.post("/schedule", data);
export const updateSchedule = (id, data) => api.put(`/schedule/${id}`, data);
export const deleteSchedule = (id) => api.delete(`/schedule/${id}`);
