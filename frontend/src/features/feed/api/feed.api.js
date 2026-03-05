// src/features/feed/api/feed.api.js
import { http } from "../../../services/http";

export const feedApi = {
  async getFeed(params = {}) {
    const res = await http.get("/content/feed", { params });
    return res.data;
  },
};
