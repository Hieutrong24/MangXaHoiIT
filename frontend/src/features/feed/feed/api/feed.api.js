import { http } from "../../../services/http";

function getUserId() {
  return (
    localStorage.getItem("userId") ||
    localStorage.getItem("uid") ||
    localStorage.getItem("currentUserId") ||
    JSON.parse(localStorage.getItem("user") || "null")?.id ||
    JSON.parse(localStorage.getItem("user") || "null")?._id ||
    ""
  );
}

export const feedApi = {
  async getFeed(params = {}) {
    const userId = getUserId();
    const res = await http.get("/content/feed", {
      params,
      headers: userId ? { "x-user-id": userId } : {},
    });
    return res.data;
  },

  async getPostById(postId) {
    const res = await http.get(`/content/posts/${postId}`);
    return res.data;
  },

  async getRecommendations(params = {}) {
    const userId = getUserId();
    const res = await http.get("/content/posts/recommendations", {
      params,
      headers: userId ? { "x-user-id": userId } : {},
    });
    return res.data;
  },

  async getTrending(params = {}) {
    const res = await http.get("/content/posts/trending", { params });
    return res.data;
  },

  async createPost(body) {
    const userId = getUserId();
    const res = await http.post(
      "/content/posts",
      {
        ...body,
        authorId: body?.authorId || userId,
      },
      {
        headers: userId ? { "x-user-id": userId } : {},
      }
    );
    return res.data;
  },

  async toggleLike(postId) {
    const userId = getUserId();
    const res = await http.post(
      `/content/posts/${postId}/like`,
      userId ? { userId } : {},
      {
        headers: userId ? { "x-user-id": userId } : {},
      }
    );
    return res.data;
  },

  async sharePost(postId) {
    const userId = getUserId();
    const res = await http.post(
      `/content/posts/${postId}/share`,
      userId ? { userId } : {},
      {
        headers: userId ? { "x-user-id": userId } : {},
      }
    );
    return res.data;
  },

  async getComments(postId, params = {}) {
    const res = await http.get(`/content/posts/${postId}/comments`, { params });
    return res.data;
  },

  async createComment(postId, body) {
    const userId = getUserId();
    const res = await http.post(
      `/content/posts/${postId}/comments`,
      {
        ...body,
        authorId: body?.authorId || userId,
      },
      {
        headers: userId ? { "x-user-id": userId } : {},
      }
    );
    return res.data;
  },

  async deletePost(postId) {
    const res = await http.delete(`/content/posts/${postId}`);
    return res.data;
  },
};
