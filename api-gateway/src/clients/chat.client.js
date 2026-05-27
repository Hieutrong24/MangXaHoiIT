const { env } = require("../config/env");
const { createHttpClient } = require("../utils/httpClient");
const { SERVICE_NAMES } = require("../config/constants");

const http = createHttpClient({
  baseURL: env.CHAT_SERVICE_URL,
  serviceName: SERVICE_NAMES.CHAT,
});

function withCtx(config = {}, ctx) {
  const headers = { ...(config.headers || {}) };

  if (ctx?.authHeader) headers["Authorization"] = ctx.authHeader;
  if (ctx?.xUserId) headers["X-User-Id"] = String(ctx.xUserId);

  return { ...config, headers, __ctx: ctx };
}

const chatClient = {
  async listGroups(ctx) {
    const res = await http.get('/api/groups', withCtx({}, ctx));
    return res.data;
  },

  async createGroup(body, ctx) {
    const res = await http.post('/api/groups', body, withCtx({}, ctx));
    return res.data;
  },

  async getGroupDetail(chatId, ctx) {
    const res = await http.get(
      `/api/groups/${encodeURIComponent(chatId)}`,
      withCtx({}, ctx)
    );
    return res.data;
  },

  async updateGroup(chatId, body, ctx) {
    const res = await http.patch(
      `/api/groups/${encodeURIComponent(chatId)}`,
      body,
      withCtx({}, ctx)
    );
    return res.data;
  },

  async listGroupMembers(chatId, ctx) {
    const res = await http.get(
      `/api/groups/${encodeURIComponent(chatId)}/members`,
      withCtx({}, ctx)
    );
    return res.data;
  },

  async addGroupMembers(chatId, body, ctx) {
    const res = await http.post(
      `/api/groups/${encodeURIComponent(chatId)}/members`,
      body,
      withCtx({}, ctx)
    );
    return res.data;
  },

  async removeGroupMember(chatId, memberUserId, ctx) {
    const res = await http.delete(
      `/api/groups/${encodeURIComponent(chatId)}/members/${encodeURIComponent(memberUserId)}`,
      withCtx({}, ctx)
    );
    return res.data;
  },

  async updateGroupMemberRole(chatId, memberUserId, body, ctx) {
    const res = await http.patch(
      `/api/groups/${encodeURIComponent(chatId)}/members/${encodeURIComponent(memberUserId)}/role`,
      body,
      withCtx({}, ctx)
    );
    return res.data;
  },

  async leaveGroup(chatId, ctx) {
    const res = await http.post(
      `/api/groups/${encodeURIComponent(chatId)}/leave`,
      {},
      withCtx({}, ctx)
    );
    return res.data;
  },

  async getMessages(chatId, query, ctx) {
    const res = await http.get(
      `/api/chats/${encodeURIComponent(chatId)}/messages`,
      withCtx({ params: query }, ctx)
    );
    return res.data;
  },

  async sendMessage(chatId, body, ctx) {
    const res = await http.post(
      `/api/chats/${encodeURIComponent(chatId)}/messages`,
      body,
      withCtx({}, ctx)
    );
    return res.data;
  },

  async getPresence(userId, ctx) {
    const res = await http.get(
      `/api/presence/${encodeURIComponent(userId)}`,
      withCtx({}, ctx)
    );
    return res.data;
  },

  async queryPresence(userIds, ctx) {
    const res = await http.post(
      '/api/presence/query',
      { userIds },
      withCtx({}, ctx)
    );
    return res.data;
  },

  async adminGetDashboard(ctx) {
    const res = await http.get('/api/admin/dashboard', withCtx({}, ctx));
    return res.data;
  },

  async adminListGroups(query = {}, ctx) {
    const res = await http.get('/api/admin/groups', withCtx({ params: query }, ctx));
    return res.data;
  },

  async adminGetGroup(chatId, ctx) {
    const res = await http.get(`/api/admin/groups/${encodeURIComponent(chatId)}`, withCtx({}, ctx));
    return res.data;
  },

  async adminListMessages(chatId, query = {}, ctx) {
    const res = await http.get(`/api/admin/groups/${encodeURIComponent(chatId)}/messages`, withCtx({ params: query }, ctx));
    return res.data;
  },

  async adminDeleteGroup(chatId, ctx) {
    const res = await http.delete(`/api/admin/groups/${encodeURIComponent(chatId)}`, withCtx({}, ctx));
    return res.data;
  },

  async adminDeleteMessage(messageId, ctx) {
    const res = await http.delete(`/api/admin/messages/${encodeURIComponent(messageId)}`, withCtx({}, ctx));
    return res.data;
  },
};

module.exports = { chatClient };
