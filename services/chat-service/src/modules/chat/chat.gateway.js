// src/modules/chat/chat.gateway.js

function userRoom(userId) {
  return `user:${String(userId)}`;
}

function parseDmPeerIds(chatId) {
  try {
    const s = String(chatId || "");
    if (!s.startsWith("dm:")) return null;

    const parts = s.split(":");
    if (parts.length !== 3) return null;

    return {
      a: String(parts[1]),
      b: String(parts[2]),
    };
  } catch {
    return null;
  }
}

function isAuthenticatedUser(userId) {
  return !!userId && String(userId).trim() !== "" && String(userId) !== "anonymous";
}

function safeAck(ack, payload) {
  if (typeof ack === "function") {
    ack(payload);
  }
}

function registerChatGateway({ io, chatService, getUserId }) {
  if (!io) throw new Error("io required");
  if (!chatService) throw new Error("chatService required");
  if (!getUserId) throw new Error("getUserId required");

  const relayToUser = (toUserId, event, data) => {
    if (!toUserId) return;
    io.to(userRoom(toUserId)).emit(event, data);
  };

  io.on("connection", (socket) => {
    const userId = getUserId(socket);

    if (isAuthenticatedUser(userId)) {
      socket.join(userRoom(userId));
    }

    socket.on("chat:join", async (payload, ack) => {
      try {
        const chatId = String(payload?.chatId || "").trim();
        if (!chatId) throw new Error("chatId required");

        await socket.join(chatId);

        safeAck(ack, { ok: true, chatId });
      } catch (e) {
        safeAck(ack, { ok: false, error: e.message });
      }
    });

    socket.on("chat:leave", async (payload, ack) => {
      try {
        const chatId = String(payload?.chatId || "").trim();
        if (!chatId) throw new Error("chatId required");

        await socket.leave(chatId);

        safeAck(ack, { ok: true, chatId });
      } catch (e) {
        safeAck(ack, { ok: false, error: e.message });
      }
    });

    socket.on("message:send", async (payload, ack) => {
      try {
        if (!isAuthenticatedUser(userId)) {
          throw new Error("Unauthorized");
        }

        const chatId = String(payload?.chatId || "").trim();
        if (!chatId) throw new Error("chatId required");

        const dto = await chatService.sendMessage({
          chatId,
          senderId: String(userId),
          type: payload?.type || "text",
          content: payload?.content,
          meta: payload?.meta || {},
          clientMessageId: payload?.clientMessageId || null,
        });

        // Không emit message:new ở đây nữa.
        // Việc broadcast realtime sẽ do message-sent.handler.js xử lý
        // để tránh double emit và thuận tiện publish RabbitMQ.

        safeAck(ack, { ok: true, message: dto });
      } catch (e) {
        safeAck(ack, { ok: false, error: e.message });
      }
    });

    socket.on("message:list", async (payload, ack) => {
      try {
        const chatId = String(payload?.chatId || "").trim();
        const limit = payload?.limit ?? 30;
        const beforeId = payload?.beforeId ?? null;

        if (!chatId) throw new Error("chatId required");

        const data = await chatService.listMessages(chatId, { limit, beforeId });
        safeAck(ack, { ok: true, ...data });
      } catch (e) {
        safeAck(ack, { ok: false, error: e.message });
      }
    });

    socket.on("typing", (payload) => {
      const chatId = String(payload?.chatId || "").trim();
      if (!chatId) return;

      if (!isAuthenticatedUser(userId)) return;

      const isTyping = !!payload?.isTyping;

      socket.to(chatId).emit("typing", {
        chatId,
        userId: String(userId),
        isTyping,
      });
    });

    socket.on("call:invite", (payload, ack) => {
      try {
        if (!isAuthenticatedUser(userId)) throw new Error("Unauthorized");

        const callId = String(payload?.callId || "").trim();
        const toUserId = String(payload?.toUserId || "").trim();

        if (!callId || !toUserId) {
          throw new Error("callId/toUserId required");
        }

        relayToUser(toUserId, "call:invite", {
          ...payload,
          callId,
          toUserId,
          fromUserId: String(userId),
        });

        safeAck(ack, { ok: true });
      } catch (e) {
        safeAck(ack, { ok: false, error: e.message });
      }
    });

    socket.on("call:answer", (payload, ack) => {
      try {
        if (!isAuthenticatedUser(userId)) throw new Error("Unauthorized");

        const callId = String(payload?.callId || "").trim();
        const toUserId = String(payload?.toUserId || "").trim();
        const answer = payload?.answer;

        if (!callId || !toUserId || !answer) {
          throw new Error("invalid answer payload");
        }

        relayToUser(toUserId, "call:answer", {
          ...payload,
          callId,
          toUserId,
          fromUserId: String(userId),
        });

        safeAck(ack, { ok: true });
      } catch (e) {
        safeAck(ack, { ok: false, error: e.message });
      }
    });

    socket.on("call:ice", (payload) => {
      if (!isAuthenticatedUser(userId)) return;

      const callId = String(payload?.callId || "").trim();
      const toUserId = String(payload?.toUserId || "").trim();
      const candidate = payload?.candidate;

      if (!callId || !toUserId || !candidate) return;

      relayToUser(toUserId, "call:ice", {
        ...payload,
        callId,
        toUserId,
        fromUserId: String(userId),
      });
    });

    socket.on("call:reject", (payload, ack) => {
      try {
        if (!isAuthenticatedUser(userId)) throw new Error("Unauthorized");

        const callId = String(payload?.callId || "").trim();
        const toUserId = String(payload?.toUserId || "").trim();

        if (!callId || !toUserId) {
          throw new Error("callId/toUserId required");
        }

        relayToUser(toUserId, "call:reject", {
          ...payload,
          callId,
          toUserId,
          fromUserId: String(userId),
        });

        safeAck(ack, { ok: true });
      } catch (e) {
        safeAck(ack, { ok: false, error: e.message });
      }
    });

    socket.on("call:hangup", (payload, ack) => {
      try {
        if (!isAuthenticatedUser(userId)) throw new Error("Unauthorized");

        const callId = String(payload?.callId || "").trim();
        const toUserId = String(payload?.toUserId || "").trim();

        if (!callId || !toUserId) {
          throw new Error("callId/toUserId required");
        }

        relayToUser(toUserId, "call:hangup", {
          ...payload,
          callId,
          toUserId,
          fromUserId: String(userId),
        });

        safeAck(ack, { ok: true });
      } catch (e) {
        safeAck(ack, { ok: false, error: e.message });
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("[chat.gateway] socket disconnected:", {
        socketId: socket.id,
        userId,
        reason,
      });
    });
  });
}

module.exports = {
  registerChatGateway,
  userRoom,
  parseDmPeerIds,
};