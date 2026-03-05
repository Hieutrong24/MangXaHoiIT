// src/features/profile/api/profile.api.js
import { http } from "../../../services/http";

export const profileApi = {
  async getMe() {
    const res = await http.get("/users/me");
    return res.data?.data ?? res.data;
  },

  async getById(userId) {
    if (!userId || userId === "undefined") {
      const err = new Error("MISSING_USER_ID_PARAM");
      err.code = "MISSING_USER_ID_PARAM";
      throw err;
    }

    const res = await http.get(`/users/${encodeURIComponent(userId)}`);
    return res.data?.data ?? res.data;
  },

  async getPostById(postId) {
    if (!postId) {
      const err = new Error("MISSING_POST_ID");
      err.code = "MISSING_POST_ID";
      throw err;
    }

    const res = await http.get(
      `/content/posts/${encodeURIComponent(postId)}`
    );

    return res.data?.data ?? res.data;
  },

  async getPostsByUser(userId, query = {}) {
    if (!userId) {
      const err = new Error("MISSING_USER_ID");
      err.code = "MISSING_USER_ID";
      throw err;
    }

    const res = await http.get("/content/feed", {
      params: { userId, ...query },
    });

    return res.data?.data ?? res.data;
  },
};