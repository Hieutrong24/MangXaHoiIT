// src/routes/chat.routes.js
const express = require("express");
const { chatController } = require("../controllers/chat.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

const router = express.Router();

// tất cả chat phải login
router.use(authMiddleware());

// GET /api/chats/:chatId/messages
router.get("/:chatId/messages", chatController.getMessages);

// POST /api/chats/:chatId/messages
router.post("/:chatId/messages", chatController.sendMessage);

module.exports = { chatRoutes: router };