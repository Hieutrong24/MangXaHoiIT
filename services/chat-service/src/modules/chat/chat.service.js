// src/modules/chat/chat.service.js
const repo = require("./chat.repository");
const { emitMessageSent } = require("../../events/message-sent.event");

function sanitizeText(s) {
  return String(s ?? "").replace(/\r\n/g, "\n");
}

function validateSend({ chatId, senderId, type, content }) {
  if (!chatId || typeof chatId !== "string") throw new Error("chatId required");
  if (!senderId || typeof senderId !== "string") throw new Error("senderId required");
  if (!type) type = "text";

  const allowed = new Set(["text", "system", "file"]);
  if (!allowed.has(type)) throw new Error("type invalid");

  const c = sanitizeText(content);
  if (!c.trim()) throw new Error("content required");
  if (c.length > 5000) throw new Error("content too long");

  return { chatId, senderId, type, content: c };
}

function toDto(m) {
  return {
    id: String(m._id),
    chatId: m.chatId,
    senderId: m.senderId,
    clientMessageId: m.clientMessageId || null,
    type: m.type,
    content: m.content,
    meta: m.meta || {},
    seq: m.seq,
    createdAt: m.createdAt
  };
}

async function sendMessage(input) {
  const { chatId, senderId, type, content } = validateSend(input);
  const meta = input.meta || {};
  const clientMessageId = input.clientMessageId || null;

  // create message (idempotent nếu clientMessageId bị gửi lại)
  let created;
  try {
    created = await repo.createMessage({
      chatId,
      senderId,
      type,
      content,
      meta,
      clientMessageId
    });
  } catch (e) {
    // duplicate clientMessageId => lấy message đã tồn tại
    // Mongo duplicate key error code: 11000
    if (e && e.code === 11000 && clientMessageId) {
      // fallback tìm message gần nhất theo clientMessageId
      // (đơn giản: query lại)
      const { MessageModel } = require("./message.model");
      const existed = await MessageModel.findOne({ chatId, senderId, clientMessageId }).lean();
      if (existed) created = existed;
      else throw e;
    } else {
      throw e;
    }
  }

  const dto = toDto(created);

  // side-effects via event bus (socket emit ở handler)
  emitMessageSent({ chatId, message: dto });

  return dto;
}

async function listMessages(chatId, { limit = 30, beforeId = null } = {}) {
  if (!chatId || typeof chatId !== "string") throw new Error("chatId required");
  const { items, nextCursor } = await repo.listMessagesByChat(chatId, { limit, beforeId });
  return {
    items: items.map(toDto),
    nextCursor
  };
}

module.exports = {
  sendMessage,
  listMessages
};
