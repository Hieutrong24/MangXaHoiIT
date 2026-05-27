import { http } from "../../../services/http";

export const uploadApi = {
  async uploadToCloudinary(file, kind = "auto") {
    const form = new FormData();
    form.append("file", file);
    form.append("kind", kind);

    const res = await http.post("/uploads/cloudinary", form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 30000,
    });

    return res.data?.data ?? res.data;
  },
};