import api from "../api/api";

export const uploadPhoto = (file) => {

    const formData = new FormData();
    formData.append("photo", file);

    return api.post("/upload/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });

};
export const uploadHomeworkFile = (file) => {

    const formData = new FormData();
    formData.append("file", file);

    return api.post("/upload/homework", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });

};
