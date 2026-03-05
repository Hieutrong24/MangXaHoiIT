// src/clients/content.client.js
const { env } = require("../config/env");
const { createHttpClient } = require("../utils/httpClient");
const { SERVICE_NAMES } = require("../config/constants");

const http = createHttpClient({
  baseURL: env.CONTENT_SERVICE_URL,
  serviceName: SERVICE_NAMES.CONTENT,
});

const contentClient = {
  async getFeed(query, ctx) {
    const res = await http.get("/api/posts", { params: query, __ctx: ctx });
    return res.data;
  },

  async createPost(body, ctx) {
    const res = await http.post("/api/posts", body, { __ctx: ctx });
    return res.data;
  },

  async getPostById(id, ctx) {
    const res = await http.get(`/api/posts/${encodeURIComponent(id)}`, { __ctx: ctx });
    return res.data;
  },

  async createComment(postId, body, ctx) {
    const res = await http.post(
      `api/posts/${encodeURIComponent(postId)}/comments`,
      body,
      { __ctx: ctx }
    );
    return res.data;
  },
};

module.exports = { contentClient };
