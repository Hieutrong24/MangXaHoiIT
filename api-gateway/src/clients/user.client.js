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

  return { ...config, headers, __ctx: ctx };
}

const userClient = {
  async createUser(body, ctx) {
    const res = await http.post("/api/users", body, withCtx({}, ctx));
    return res.data;
  },

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

  async getMeProfileFull(ctx) {
    const id = ctx?.userId ?? ctx?.xUserId;
    if (!id) {
      const err = new Error("Missing userId in ctx");
      err.status = 401;
      throw err;
    }
    const res = await http.get(`/api/users/${encodeURIComponent(id)}/profile-full`, withCtx({}, ctx));
    return res.data;
  },

  async getSettings(userId, ctx) {
    const res = await http.get(`/api/users/${encodeURIComponent(userId)}/settings`, withCtx({}, ctx));
    return res.data;
  },

  async updateSettings(userId, body, ctx) {
    const res = await http.put(`/api/users/${encodeURIComponent(userId)}/settings`, body, withCtx({}, ctx));
    return res.data;
  },

  async getProfileFull(id, ctx) {
    const res = await http.get(`/api/users/${encodeURIComponent(id)}/profile-full`, withCtx({}, ctx));
    return res.data;
  },

  async getTrustSafety(id, query = {}, ctx) {
    const res = await http.get(`/api/users/${encodeURIComponent(id)}/trust-safety`, withCtx({ params: query }, ctx));
    return res.data;
  },

  async getProfileFullByUsername(username, ctx) {
    const res = await http.get(`/api/users/by-username/${encodeURIComponent(username)}/profile-full`, withCtx({}, ctx));
    return res.data;
  },

  async updateProfileFull(id, body, ctx) {
    const res = await http.put(`/api/users/${encodeURIComponent(id)}/profile-full`, body, withCtx({}, ctx));
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

  async adminListUsers(query, ctx) {
    const res = await http.get("/api/admin/users", withCtx({ params: query }, ctx));
    return res.data;
  },

  async adminGetUser(id, ctx) {
    const res = await http.get(`/api/admin/users/${encodeURIComponent(id)}`, withCtx({}, ctx));
    return res.data;
  },

  async adminLockUser(id, body = {}, ctx) {
    const res = await http.patch(`/api/admin/users/${encodeURIComponent(id)}/lock`, body, withCtx({}, ctx));
    return res.data;
  },

  async adminUnlockUser(id, body = {}, ctx) {
    const res = await http.patch(`/api/admin/users/${encodeURIComponent(id)}/unlock`, body, withCtx({}, ctx));
    return res.data;
  },

  async adminDeleteUser(id, body = {}, ctx) {
    const res = await http.delete(`/api/admin/users/${encodeURIComponent(id)}`, withCtx({ data: body }, ctx));
    return res.data;
  },

  async adminListActivityLogs(query, ctx) {
    const res = await http.get("/api/admin/users/activity-logs", withCtx({ params: query }, ctx));
    return res.data;
  },

  async adminGetActivityDashboard(query, ctx) {
    const res = await http.get("/api/admin/users/activity-dashboard", withCtx({ params: query }, ctx));
    return res.data;
  },
};

module.exports = { userClient };
