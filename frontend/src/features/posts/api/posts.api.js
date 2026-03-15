import { http } from "../../../services/http";

export const postsApi = {
  async list(params = {}) {
    const res = await http.get("/content/posts", { params });
    return res.data;
  },

  async getById(id) {
    const res = await http.get(`/content/posts/${encodeURIComponent(id)}`);
    return res.data;
  },

  async create(payload) {
    const res = await http.post("/content/posts", payload);
    return res.data;
  },

  async addComment(postId, payload) {
    const res = await http.post(
      `/content/posts/${encodeURIComponent(postId)}/comments`,
      payload
    );
    return res.data;
  },
};