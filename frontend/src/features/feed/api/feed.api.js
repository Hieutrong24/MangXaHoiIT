import { http } from "../../../services/http";

export const feedApi = {
  async getFeed(params = {}) {
    const res = await http.get("/content/feed", { params });
    return res.data;
  },

  async toggleLike(postId) {
    const res = await http.post(`/content/posts/${postId}/like`);
    return res.data;
  },

  async sharePost(postId) {
    const res = await http.post(`/content/posts/${postId}/share`);
    return res.data;
  },

  async getComments(postId, params = {}) {
    const res = await http.get(`/content/posts/${postId}/comments`, { params });
    return res.data;
  },

  async createComment(postId, body) {
    const res = await http.post(`/content/posts/${postId}/comments`, body);
    return res.data;
  },
};