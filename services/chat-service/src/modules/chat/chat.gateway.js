// src/modules/chat/chat.gateway.js

function userRoom(userId) {
  return `user:${String(userId)}`;
}

// dm:<a>:<b>  (a,b sorted)
function parseDmPeerIds(chatId) {
  try {
    const s = String(chatId || "");
    // dm:111:222
    if (!s.startsWith("dm:")) return null;
    const parts = s.split(":");
    if (parts.length !== 3) return null;
    return { a: parts[1], b: parts[2] };
  } catch {
    return null;
  }
}

function registerChatGateway({ io, chatService, getUserId }) {
  if (!io) throw new Error("io required");
  if (!chatService) throw new Error("chatService required");
  if (!getUserId) throw new Error("getUserId required");

  io.on("connection", (socket) => {
    const userId = getUserId(socket);

    // ✅ join personal room so server can always reach this user
    if (userId) {
      socket.join(userRoom(userId));
    }

    // ================== CHAT ROOMS ==================
    socket.on("chat:join", async (payload, ack) => {
      try {
        const chatId = payload?.chatId;
        if (!chatId) throw new Error("chatId required");

        await socket.join(chatId);

        // optional: confirm joined
        ack && ack({ ok: true, chatId });
      } catch (e) {
        ack && ack({ ok: false, error: e.message });
      }
    });

    socket.on("chat:leave", async (payload, ack) => {
      try {
        const chatId = payload?.chatId;
        if (!chatId) throw new Error("chatId required");

        await socket.leave(chatId);
        ack && ack({ ok: true, chatId });
      } catch (e) {
        ack && ack({ ok: false, error: e.message });
      }
    });

    // ================== MESSAGES ==================
    socket.on("message:send", async (payload, ack) => {
      try {
        if (!userId) throw new Error("Unauthorized");

        const chatId = payload?.chatId;
        if (!chatId) throw new Error("chatId required");

        const dto = await chatService.sendMessage({
          chatId,
          senderId: userId,
          type: payload?.type || "text",
          content: payload?.content,
          meta: payload?.meta || {},
          clientMessageId: payload?.clientMessageId || null,
        });

        // ✅ 1) Emit to room chat (if both joined)
        io.to(chatId).emit("message:new", { chatId, message: dto });

        // ✅ 2) ALSO emit to personal rooms (always works)
        // For DM chatId, infer peer ids from chatId
        const dm = parseDmPeerIds(chatId);

        if (dm) {
          // dm.a / dm.b are already sorted ids in chatId
          io.to(userRoom(dm.a)).emit("message:new", { chatId, message: dto });
          io.to(userRoom(dm.b)).emit("message:new", { chatId, message: dto });
        } else {
          // if group chat later: you should have member list in DB
          // for now just ensure sender still receives:
          io.to(userRoom(userId)).emit("message:new", { chatId, message: dto });
        }

        // ack for sender (client should NOT double-add; dedup by message._id)
        ack && ack({ ok: true, message: dto });
      } catch (e) {
        ack && ack({ ok: false, error: e.message });
      }
    });

    socket.on("message:list", async (payload, ack) => {
      try {
        const chatId = payload?.chatId;
        const limit = payload?.limit ?? 30;
        const beforeId = payload?.beforeId ?? null;

        if (!chatId) throw new Error("chatId required");

        const data = await chatService.listMessages(chatId, { limit, beforeId });
        ack && ack({ ok: true, ...data });
      } catch (e) {
        ack && ack({ ok: false, error: e.message });
      }
    });

    socket.on("typing", (payload) => {
      const chatId = payload?.chatId;
      if (!chatId) return;
      const isTyping = !!payload?.isTyping;

      // broadcast within chat room
      socket.to(chatId).emit("typing", { chatId, userId, isTyping });
    });

    // ================== CALL SIGNALING (RELAY) ==================
    const relayToUser = (toUserId, event, data) => {
      if (!toUserId) return;
      io.to(userRoom(toUserId)).emit(event, data);
    };

    socket.on("call:invite", (p, ack) => {
      try {
        if (!userId) throw new Error("Unauthorized");
        if (!p?.callId || !p?.toUserId) throw new Error("callId/toUserId required");

        const payload = { ...p, fromUserId: userId };
        relayToUser(p.toUserId, "call:invite", payload);
        ack && ack({ ok: true });
      } catch (e) {
        ack && ack({ ok: false, error: e.message });
      }
    });

    socket.on("call:answer", (p, ack) => {
      try {
        if (!userId) throw new Error("Unauthorized");
        if (!p?.callId || !p?.toUserId || !p?.answer) throw new Error("invalid answer payload");

        const payload = { ...p, fromUserId: userId };
        relayToUser(p.toUserId, "call:answer", payload);
        ack && ack({ ok: true });
      } catch (e) {
        ack && ack({ ok: false, error: e.message });
      }
    });

    socket.on("call:ice", (p) => {
      if (!userId) return;
      if (!p?.callId || !p?.toUserId || !p?.candidate) return;
      relayToUser(p.toUserId, "call:ice", { ...p, fromUserId: userId });
    });

    socket.on("call:reject", (p, ack) => {
      try {
        if (!userId) throw new Error("Unauthorized");
        if (!p?.callId || !p?.toUserId) throw new Error("callId/toUserId required");

        relayToUser(p.toUserId, "call:reject", { ...p, fromUserId: userId });
        ack && ack({ ok: true });
      } catch (e) {
        ack && ack({ ok: false, error: e.message });
      }
    });

    socket.on("call:hangup", (p, ack) => {
      try {
        if (!userId) throw new Error("Unauthorized");
        if (!p?.callId || !p?.toUserId) throw new Error("callId/toUserId required");

        relayToUser(p.toUserId, "call:hangup", { ...p, fromUserId: userId });
        ack && ack({ ok: true });
      } catch (e) {
        ack && ack({ ok: false, error: e.message });
      }
    });
  });
}

module.exports = { registerChatGateway };