// src/features/search/api/search.api.js
import { http } from "../../../services/http";

export const searchApi = {
  async search(params = {}) {
    const res = await http.get("/content/search", { params });
    return res.data;
  },
};
