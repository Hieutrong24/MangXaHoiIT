// src/controllers/chat.controller.js
const { chatClient } = require("../clients/chat.client");

function makeCtx(req) {
  const authHeader = req.headers?.authorization || req.authHeader || null;

  // authMiddleware thường set req.user.{id|userId}
  const userId = req.user?.id || req.user?.userId || null;

  return {
    correlationId: req.correlationId,
    authHeader,
    xUserId: userId, // sẽ forward thành header X-User-Id
  };
}

const chatController = {
  async getMessages(req, res, next) {
    try {
      const ctx = makeCtx(req);
      const data = await chatClient.getMessages(req.params.chatId, req.query, ctx);
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },

  async sendMessage(req, res, next) {
    try {
      const ctx = makeCtx(req);
      const data = await chatClient.sendMessage(req.params.chatId, req.body, ctx);
      res.status(201).json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },
};

module.exports = { chatController };