const { onMessageSent } = require("./message-sent.event");
const { publishMessageSent } = require("../messaging/chat.publisher");

function userRoom(userId) {
  return `user:${String(userId)}`;
}

function parseDmPeerIds(chatId) {
  try {
    const s = String(chatId || "");
    if (!s.startsWith("dm:")) return null;
    const parts = s.split(":");
    if (parts.length !== 3) return null;
    return { a: parts[1], b: parts[2] };
  } catch {
    return null;
  }
}

function registerMessageSentHandler({ io }) {
  if (!io) throw new Error("io is required");

  onMessageSent(async (evt) => {
    try {
      const { chatId, message } = evt || {};
      if (!chatId || !message) return;

      io.to(chatId).emit("message:new", { chatId, message });

      const dm = parseDmPeerIds(chatId);
      if (dm) {
        io.to(userRoom(dm.a)).emit("message:new", { chatId, message });
        io.to(userRoom(dm.b)).emit("message:new", { chatId, message });
      } else if (message.senderId) {
        io.to(userRoom(message.senderId)).emit("message:new", { chatId, message });
      }

      await publishMessageSent(evt);
    } catch (e) {
      console.error("[chat.message.sent.handler] error:", e);
    }
  });
}

module.exports = { registerMessageSentHandler };