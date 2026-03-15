const { env } = require("../config/env");
const { createHttpClient } = require("../utils/httpClient");
const { SERVICE_NAMES } = require("../config/constants");

const http = createHttpClient({
  baseURL: env.USER_SERVICE_URL,
  serviceName: SERVICE_NAMES.USER,
});

function withCtx(config = {}, ctx) {
  const headers = { ...(config.headers || {}) };

  const authHeader = ctx?.authHeader;
  const userId = ctx?.userId ?? ctx?.xUserId;

  if (authHeader) headers["Authorization"] = authHeader;
  if (userId) {
    headers["X-User-Id"] = String(userId);
    headers["x-user-id"] = String(userId);
  }

  // ✅ interceptor đọc ctx
  return { ...config, headers, __ctx: ctx };
}

const userClient = {
  async getMe(ctx) {
  const id = ctx?.userId ?? ctx?.xUserId;
    if (!id) {
      const err = new Error("Missing userId in ctx");
      err.status = 401;
      throw err;
    }
    const res = await http.get(`/api/users/${encodeURIComponent(id)}`, withCtx({}, ctx));
    return res.data;
  },
  async getUserById(id, ctx) {
    const res = await http.get(`/api/users/${encodeURIComponent(id)}`, withCtx({}, ctx));
    return res.data;
  },

  async followUser(id, ctx) {
    const res = await http.post(`/api/users/${encodeURIComponent(id)}/follow`, null, withCtx({}, ctx));
    return res.data;
  },

  async unfollowUser(id, ctx) {
    const res = await http.post(`/api/users/${encodeURIComponent(id)}/unfollow`, null, withCtx({}, ctx));
    return res.data;
  },

  async listFriends(query, ctx) {
    const res = await http.get("/api/friends", withCtx({ params: query }, ctx));
    return res.data;
  },

  async listSuggestions(query, ctx) {
    const res = await http.get("/api/friends/suggestions", withCtx({ params: query }, ctx));
    return res.data;
  },

  async getAllUser(query, ctx) {
    const res = await http.get("/api/users", withCtx({ params: query }, ctx));
    return res.data;
  },

  async sendFriendRequest(toUserId, ctx, payload = {}) {
    const res = await http.post(
      `/api/friend-requests/${encodeURIComponent(toUserId)}`,
      payload,
      withCtx({}, ctx)
    );
    return res.data;
  },

  async acceptFriendRequest(requestId, ctx) {
    const res = await http.post(
      `/api/friend-requests/${encodeURIComponent(requestId)}/accept`,
      null,
      withCtx({}, ctx)
    );
    return res.data;
  },

  async rejectFriendRequest(requestId, ctx) {
    const res = await http.post(
      `/api/friend-requests/${encodeURIComponent(requestId)}/reject`,
      null,
      withCtx({}, ctx)
    );
    return res.data;
  },

  async cancelFriendRequest(requestId, ctx) {
    const res = await http.post(
      `/api/friend-requests/${encodeURIComponent(requestId)}/cancel`,
      null,
      withCtx({}, ctx)
    );
    return res.data;
  },

  async listIncomingRequests(query, ctx) {
    const res = await http.get("/api/friend-requests/incoming", withCtx({ params: query }, ctx));
    return res.data;
  },

  async listOutgoingRequests(query, ctx) {
    const res = await http.get("/api/friend-requests/outgoing", withCtx({ params: query }, ctx));
    return res.data;
  },
};

module.exports = { userClient };