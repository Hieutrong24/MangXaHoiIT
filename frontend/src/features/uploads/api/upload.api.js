// src/features/uploads/api/upload.api.js
import { http } from "../../../services/http";

export const uploadApi = {
  async cloudinaryUpload(file, kind) {
    const form = new FormData();
    form.append("file", file);
    form.append("kind", kind); // image | video | raw
    const res = await http.post("/uploads/cloudinary", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data?.data ?? res.data;  
  },
};