const { env } = require('../config/env');
const { createHttpClient } = require('../utils/httpClient');
const { SERVICE_NAMES } = require('../config/constants');

const http = createHttpClient({
  baseURL: env.NOTIFICATION_SERVICE_URL,
  serviceName: SERVICE_NAMES.NOTIFICATION,
});

function withCtx(config = {}, ctx) {
  const headers = { ...(config.headers || {}) };

  if (ctx?.authHeader) headers.Authorization = ctx.authHeader;
  if (ctx?.xUserId) headers['X-User-Id'] = String(ctx.xUserId);
  if (env.INTERNAL_API_TOKEN) headers['x-internal-token'] = env.INTERNAL_API_TOKEN;

  return { ...config, headers, __ctx: ctx };
}

const notificationClient = {
  async list(query, ctx) {
    const res = await http.get('/api/notifications', withCtx({ params: query }, ctx));
    return res.data;
  },
  async unreadCount(ctx) {
    const res = await http.get('/api/notifications/unread-count', withCtx({}, ctx));
    return res.data;
  },
  async markAsRead(id, ctx) {
    const res = await http.patch(`/api/notifications/${encodeURIComponent(id)}/read`, {}, withCtx({}, ctx));
    return res.data;
  },
  async markAllAsRead(ctx) {
    const res = await http.patch('/api/notifications/read-all', {}, withCtx({}, ctx));
    return res.data;
  },
  async remove(id, ctx) {
    const res = await http.delete(`/api/notifications/${encodeURIComponent(id)}`, withCtx({}, ctx));
    return res.data;
  },
  async getPreferences(ctx) {
    const res = await http.get('/api/preferences', withCtx({}, ctx));
    return res.data;
  },
  async updatePreferences(body, ctx) {
    const res = await http.put('/api/preferences', body, withCtx({}, ctx));
    return res.data;
  },
  async publishEvent(eventName, payload, ctx = {}) {
    const res = await http.post('/api/internal/events/publish', { eventName, payload }, withCtx({}, ctx));
    return res.data;
  },

  async adminList(query = {}, ctx) {
    const res = await http.get('/api/admin/notifications', withCtx({ params: query }, ctx));
    return res.data;
  },

  async adminBroadcast(body, ctx) {
    const res = await http.post('/api/admin/notifications/broadcast', body, withCtx({}, ctx));
    return res.data;
  },

  async adminGetDashboard(ctx) {
    const res = await http.get('/api/admin/notifications/dashboard', withCtx({}, ctx));
    return res.data;
  },
};

module.exports = { notificationClient };
