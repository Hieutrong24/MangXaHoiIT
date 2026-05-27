// src/features/tags/api/tags.api.js
import { http } from "../../../services/http";

export const tagsApi = {
  async list() {
    const res = await http.get("/content/tags");
    return res.data;
  },
  async detail(slug) {
    const res = await http.get(`/content/tags/${encodeURIComponent(slug)}`);
    return res.data;
  },
};
