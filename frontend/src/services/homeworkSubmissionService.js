import api from "../api/api";

export const getHomeworkSubmissions = () => api.get("/homework-submissions");
export const createHomeworkSubmission = (data) =>
    api.post("/homework-submissions", data);
export const updateHomeworkSubmission = (id, data) =>
    api.put(`/homework-submissions/${id}`, data);
export const deleteHomeworkSubmission = (id) =>
    api.delete(`/homework-submissions/${id}`);
