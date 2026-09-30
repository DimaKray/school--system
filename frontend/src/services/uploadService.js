import api from "../api/api";

export const uploadPhoto = (file) => {

    const formData = new FormData();
    formData.append("photo", file);

    return api.post("/upload/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });

};