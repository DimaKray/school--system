import api from "../api/api";

export const getParents = () => api.get("/parents");
export const addChild = (parentId, studentId) =>
    api.post(`/parents/${parentId}/children`, { student_id: studentId });
export const removeChild = (parentId, studentId) =>
    api.delete(`/parents/${parentId}/children/${studentId}`);
