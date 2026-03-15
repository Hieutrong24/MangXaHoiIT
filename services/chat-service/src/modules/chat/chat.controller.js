// src/modules/chat/chat.controller.js
const express = require("express");

function getUserIdFromReq(req) {
  return req.headers["x-user-id"] || req.headers["x-userid"] || null;
}

function buildChatRouter({ chatService }) {
  const router = express.Router();

  router.get("/health", (_, res) => res.json({ ok: true }));

  // GET /api/chats/:chatId/messages?limit=30&beforeId=...
  router.get("/chats/:chatId/messages", async (req, res) => {
    try {
      const chatId = req.params.chatId;
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 30;
      const beforeId = req.query.beforeId ? String(req.query.beforeId) : null;

      const data = await chatService.listMessages(chatId, { limit, beforeId });
      res.json(data);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  // POST /api/chats/:chatId/messages
  router.post("/chats/:chatId/messages", async (req, res) => {
    try {
      const senderId = getUserIdFromReq(req);
      if (!senderId) return res.status(401).json({ error: "x-user-id required" });

      const chatId = req.params.chatId;
      const dto = await chatService.sendMessage({
        chatId,
        senderId,
        type: req.body?.type || "text",
        content: req.body?.content,
        meta: req.body?.meta || {},
        clientMessageId: req.body?.clientMessageId || null
      });

      res.status(201).json({ message: dto });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  return router;
}

module.exports = { buildChatRouter };
