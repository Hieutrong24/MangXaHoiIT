// src/clients/auth.client.js
const { env } = require("../config/env");
const { createHttpClient } = require("../utils/httpClient");
const { SERVICE_NAMES } = require("../config/constants");

const http = createHttpClient({
  baseURL: env.AUTH_SERVICE_URL,
  serviceName: SERVICE_NAMES.AUTH,
});

const authClient = {
  async login(body, ctx) {
    const res = await http.post("/api/auth/login", body, { __ctx: ctx });
    return res.data;
  },
  async register(body, ctx) {
    const res = await http.post("/api/auth/register", body, { __ctx: ctx });
    return res.data;
  },
  async refresh(body, ctx) {
    const res = await http.post("/api/auth/refresh", body, { __ctx: ctx });
    return res.data;
  },
  async logout(body, ctx) {
    const res = await http.post("/api/auth/logout", body, { __ctx: ctx });
    return res.data;
  },
  async googleCallback(body, ctx) {
    const res = await http.post("/api/auth/google/callback", body, { __ctx: ctx });
    return res.data;
  },
  async ping(ctx) {
    const res = await http.get("/swagger/index.html", { __ctx: ctx });
    return { ok: true, status: res.status };
  },
  async adminListAccounts(query, ctx) {
    const res = await http.get("/api/admin/auth/accounts", { params: query, __ctx: ctx });
    return res.data;
  },
  async adminGetAccount(userId, ctx) {
    const res = await http.get(`/api/admin/auth/accounts/${encodeURIComponent(userId)}`, { __ctx: ctx });
    return res.data;
  },
  async adminLockAccount(userId, body = {}, ctx) {
    const res = await http.patch(`/api/admin/auth/accounts/${encodeURIComponent(userId)}/lock`, body, { __ctx: ctx });
    return res.data;
  },
  async adminUnlockAccount(userId, body = {}, ctx) {
    const res = await http.patch(`/api/admin/auth/accounts/${encodeURIComponent(userId)}/unlock`, body, { __ctx: ctx });
    return res.data;
  },
  async adminDeleteAccount(userId, ctx) {
    const res = await http.delete(`/api/admin/auth/accounts/${encodeURIComponent(userId)}`, { __ctx: ctx });
    return res.data;
  },
  async adminListAuditLogs(query, ctx) {
    const res = await http.get("/api/admin/auth/audit-logs", { params: query, __ctx: ctx });
    return res.data;
  },
  async adminUpdateRoles(userId, body, ctx) {
    const res = await http.put(`/api/admin/auth/accounts/${encodeURIComponent(userId)}/roles`, body, { __ctx: ctx });
    return res.data;
  },
};

module.exports = { authClient };
