import { http } from "../../../services/http";

function unwrap(res) {
  return res?.data?.data ?? res?.data ?? res;
}

export const profileApi = {
  async getMe() {
    return unwrap(await http.get("/users/me"));
  },

  async getMeFull() {
    return unwrap(await http.get("/users/me/profile-full"));
  },

  async getById(userId) {
    if (!userId || userId === "undefined") throw new Error("MISSING_USER_ID_PARAM");
    return unwrap(await http.get(`/users/${encodeURIComponent(userId)}`));
  },

  async getFull(userId) {
    if (!userId || userId === "undefined") throw new Error("MISSING_USER_ID_PARAM");
    return unwrap(await http.get(`/users/${encodeURIComponent(userId)}/profile-full`));
  },

  async updateFull(userId, payload) {
    if (!userId || userId === "undefined") throw new Error("MISSING_USER_ID_PARAM");
    return unwrap(await http.put(`/users/${encodeURIComponent(userId)}/profile-full`, payload));
  },

  async getPostById(postId) {
    if (!postId) throw new Error("MISSING_POST_ID");
    return unwrap(await http.get(`/content/posts/${encodeURIComponent(postId)}`));
  },

  async getPostsByUser(userId, query = {}) {
    if (!userId) throw new Error("MISSING_USER_ID");
    return unwrap(await http.get("/content/feed", { params: { userId, ...query } }));
  },
};
