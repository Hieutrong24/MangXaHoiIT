const FormData = require("form-data");

const { env } = require("../config/env");
const { createHttpClient } = require("../utils/httpClient");
const { SERVICE_NAMES } = require("../config/constants");

const http = createHttpClient({
  baseURL: env.CONTENT_SERVICE_URL,
  serviceName: SERVICE_NAMES.CONTENT,
});

const contentClient = {
  async listPosts(query, ctx) {
    const res = await http.get("/api/posts", {
      params: query,
      __ctx: ctx,
    });
    return res.data;
  },

  async getFeed(query, ctx) {
    const res = await http.get("/api/posts", {
      params: query,
      __ctx: ctx,
    });
    return res.data;
  },

  async createPost(body, ctx) {
    const res = await http.post("/api/posts", body, {
      __ctx: ctx,
    });
    return res.data;
  },

  async getPostById(id, ctx) {
    const res = await http.get(`/api/posts/${encodeURIComponent(id)}`, {
      __ctx: ctx,
    });
    return res.data;
  },

  async toggleLike(postId, ctx) {
    const res = await http.post(
      `/api/posts/${encodeURIComponent(postId)}/like`,
      {},
      { __ctx: ctx }
    );
    return res.data;
  },

  async sharePost(postId, ctx) {
    const res = await http.post(
      `/api/posts/${encodeURIComponent(postId)}/share`,
      {},
      { __ctx: ctx }
    );
    return res.data;
  },

  async listComments(postId, query, ctx) {
    const res = await http.get(
      `/api/posts/${encodeURIComponent(postId)}/comments`,
      {
        params: query,
        __ctx: ctx,
      }
    );
    return res.data;
  },

  async createComment(postId, body, ctx) {
    const res = await http.post(
      `/api/posts/${encodeURIComponent(postId)}/comments`,
      body,
      { __ctx: ctx }
    );
    return res.data;
  },

  async uploadToContentService(file, kind = "auto", ctx = {}) {
    if (!file) {
      throw new Error("Missing file");
    }

    const form = new FormData();
    form.append("file", file.buffer, {
      filename: file.originalname || "upload.bin",
      contentType: file.mimetype || "application/octet-stream",
      knownLength: file.size,
    });
    form.append("kind", kind || "auto");

    const headers = {
      ...form.getHeaders(),
    };

    if (ctx?.authHeader) {
      headers.Authorization = ctx.authHeader;
    }

    if (ctx?.correlationId) {
      headers["x-correlation-id"] = ctx.correlationId;
    }

    if (ctx?.user?.id || ctx?.user?.userId || ctx?.user?._id) {
      headers["x-user-id"] =
        ctx.user.id || ctx.user.userId || ctx.user._id;
    }

    const res = await http.post("/api/uploads/cloudinary", form, {
      headers,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      __ctx: ctx,
    });

    return res.data;
  },
};

module.exports = { contentClient };