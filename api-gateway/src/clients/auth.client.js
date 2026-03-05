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
  async refresh(body, ctx) {
    const res = await http.post("/api/auth/refresh", body, { __ctx: ctx });
    return res.data;
  },
  async logout(body, ctx) {
    const res = await http.post("/api/auth/logout", body, { __ctx: ctx });
    return res.data;
  },
  async ping(ctx) {
    // Auth-service của bạn có swagger, thường sẽ có /health nếu bạn tự thêm
    // Nếu CHƯA có /health thì bạn có thể ping swagger:
    const res = await http.get("/swagger/index.html", { __ctx: ctx });
    return { ok: true, status: res.status };
  },
};

module.exports = { authClient };
