// src/clients/chat.client.js
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
};

module.exports = { chatClient };