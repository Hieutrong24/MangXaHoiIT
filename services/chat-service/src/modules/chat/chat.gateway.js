function userRoom(userId) {
  return `user:${String(userId)}`;
}

function parseDmPeerIds(chatId) {
  try {
    const s = String(chatId || '');
    if (!s.startsWith('dm:')) return null;

    const parts = s.split(':');
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
  return !!userId && String(userId).trim() !== '' && String(userId) !== 'anonymous';
}

function safeAck(ack, payload) {
  if (typeof ack === 'function') {
    ack(payload);
  }
}

function normalizeIds(input) {
  if (!Array.isArray(input)) return [];
  return [...new Set(input.map((item) => String(item || '').trim()).filter(Boolean))];
}

function registerChatGateway({ io, chatService, getUserId, presenceService, publishCallInvited, publishPresenceChanged }) {
  if (!io) throw new Error('io required');
  if (!chatService) throw new Error('chatService required');
  if (!getUserId) throw new Error('getUserId required');
  if (!presenceService) throw new Error('presenceService required');

  const emitPresenceToSocket = (socket, userId) => {
    socket.emit('presence:update', presenceService.getPresence(userId));
  };

  const emitPresenceToSubscribers = (userId) => {
    const payload = presenceService.getPresence(userId);

    io.emit(`presence:user:${userId}`, payload);
    io.sockets.sockets.forEach((clientSocket) => {
      const subscriptions = clientSocket.data?.presenceSubscriptions;
      if (subscriptions && subscriptions.has(String(userId))) {
        clientSocket.emit('presence:update', payload);
      }
    });
  };

  const notifyPresenceChange = async (state) => {
    emitPresenceToSubscribers(state.userId);

    if (typeof publishPresenceChanged === 'function' && state.changed) {
      try {
        await publishPresenceChanged(state);
      } catch (error) {
        console.error('[chat.gateway] publishPresenceChanged error:', error?.message || error);
      }
    }
  };

  const relayToUser = (toUserId, event, data) => {
    if (!toUserId) return;
    io.to(userRoom(toUserId)).emit(event, data);
  };

  io.on('connection', (socket) => {
    const userId = getUserId(socket);
    socket.data.presenceSubscriptions = new Set();

    if (isAuthenticatedUser(userId)) {
      socket.join(userRoom(userId));
      const state = presenceService.markOnline(userId, socket.id);
      notifyPresenceChange(state);
      emitPresenceToSocket(socket, userId);
    }

    socket.on('presence:subscribe', (payload, ack) => {
      try {
        const userIds = normalizeIds(payload?.userIds || []);
        userIds.forEach((id) => socket.data.presenceSubscriptions.add(id));
        const items = presenceService.getMany(userIds);
        safeAck(ack, { ok: true, items });
      } catch (e) {
        safeAck(ack, { ok: false, error: e.message });
      }
    });

    socket.on('presence:unsubscribe', (payload, ack) => {
      try {
        const userIds = normalizeIds(payload?.userIds || []);
        userIds.forEach((id) => socket.data.presenceSubscriptions.delete(id));
        safeAck(ack, { ok: true, userIds });
      } catch (e) {
        safeAck(ack, { ok: false, error: e.message });
      }
    });

    socket.on('presence:query', (payload, ack) => {
      try {
        const userIds = normalizeIds(payload?.userIds || []);
        safeAck(ack, { ok: true, items: presenceService.getMany(userIds) });
      } catch (e) {
        safeAck(ack, { ok: false, error: e.message });
      }
    });

    socket.on('chat:join', async (payload, ack) => {
      try {
        const chatId = String(payload?.chatId || '').trim();
        if (!chatId) throw new Error('chatId required');

        if (isAuthenticatedUser(userId)) {
          await chatService.ensureChatAccess(chatId, userId);
        }

        await socket.join(chatId);

        const dm = parseDmPeerIds(chatId);
        if (dm) {
          const peerId = dm.a === String(userId) ? dm.b : dm.a;
          if (peerId) {
            socket.data.presenceSubscriptions.add(peerId);
            emitPresenceToSocket(socket, peerId);
          }
        }

        safeAck(ack, { ok: true, chatId });
      } catch (e) {
        safeAck(ack, { ok: false, error: e.message });
      }
    });

    socket.on('chat:leave', async (payload, ack) => {
      try {
        const chatId = String(payload?.chatId || '').trim();
        if (!chatId) throw new Error('chatId required');

        await socket.leave(chatId);

        safeAck(ack, { ok: true, chatId });
      } catch (e) {
        safeAck(ack, { ok: false, error: e.message });
      }
    });

    socket.on('message:send', async (payload, ack) => {
      try {
        if (!isAuthenticatedUser(userId)) {
          throw new Error('Unauthorized');
        }

        const chatId = String(payload?.chatId || '').trim();
        if (!chatId) throw new Error('chatId required');

        const dto = await chatService.sendMessage({
          chatId,
          senderId: String(userId),
          type: payload?.type || 'text',
          content: payload?.content,
          meta: payload?.meta || {},
          clientMessageId: payload?.clientMessageId || null,
        });

        safeAck(ack, { ok: true, message: dto });
      } catch (e) {
        safeAck(ack, { ok: false, error: e.message });
      }
    });

    socket.on('message:list', async (payload, ack) => {
      try {
        const chatId = String(payload?.chatId || '').trim();
        const limit = payload?.limit ?? 30;
        const beforeId = payload?.beforeId ?? null;

        const data = await chatService.listMessages(chatId, {
          limit,
          beforeId,
          viewerId: isAuthenticatedUser(userId) ? String(userId) : null,
        });
        safeAck(ack, { ok: true, ...data });
      } catch (e) {
        safeAck(ack, { ok: false, error: e.message });
      }
    });

    socket.on('call:invite', async (payload, ack) => {
      try {
        if (!isAuthenticatedUser(userId)) throw new Error('Unauthorized');

        const callId = String(payload?.callId || '').trim();
        const toUserId = String(payload?.toUserId || '').trim();
        const type = payload?.type === 'video' ? 'video' : 'audio';
        const offer = payload?.offer || null;

        if (!callId || !toUserId) {
          throw new Error('callId/toUserId required');
        }

        const outgoing = {
          ...payload,
          callId,
          toUserId,
          fromUserId: String(userId),
          type,
          offer,
          createdAt: new Date().toISOString(),
        };

        relayToUser(toUserId, 'call:invite', outgoing);

        if (typeof publishCallInvited === 'function') {
          try {
            await publishCallInvited(outgoing);
          } catch (error) {
            console.error('[chat.gateway] publishCallInvited error:', error?.message || error);
          }
        }

        safeAck(ack, { ok: true });
      } catch (e) {
        safeAck(ack, { ok: false, error: e.message });
      }
    });

    socket.on('call:answer', (payload, ack) => {
      try {
        if (!isAuthenticatedUser(userId)) throw new Error('Unauthorized');

        const callId = String(payload?.callId || '').trim();
        const toUserId = String(payload?.toUserId || '').trim();
        const answer = payload?.answer || null;

        if (!callId || !toUserId || !answer) {
          throw new Error('callId/toUserId/answer required');
        }

        relayToUser(toUserId, 'call:answer', {
          ...payload,
          callId,
          toUserId,
          fromUserId: String(userId),
          answer,
        });

        safeAck(ack, { ok: true });
      } catch (e) {
        safeAck(ack, { ok: false, error: e.message });
      }
    });

    socket.on('call:ice', (payload) => {
      if (!isAuthenticatedUser(userId)) return;

      const callId = String(payload?.callId || '').trim();
      const toUserId = String(payload?.toUserId || '').trim();
      const candidate = payload?.candidate;

      if (!callId || !toUserId || !candidate) return;

      relayToUser(toUserId, 'call:ice', {
        ...payload,
        callId,
        toUserId,
        fromUserId: String(userId),
      });
    });

    socket.on('call:reject', (payload, ack) => {
      try {
        if (!isAuthenticatedUser(userId)) throw new Error('Unauthorized');

        const callId = String(payload?.callId || '').trim();
        const toUserId = String(payload?.toUserId || '').trim();

        if (!callId || !toUserId) {
          throw new Error('callId/toUserId required');
        }

        relayToUser(toUserId, 'call:reject', {
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

    socket.on('call:hangup', (payload, ack) => {
      try {
        if (!isAuthenticatedUser(userId)) throw new Error('Unauthorized');

        const callId = String(payload?.callId || '').trim();
        const toUserId = String(payload?.toUserId || '').trim();

        if (!callId || !toUserId) {
          throw new Error('callId/toUserId required');
        }

        relayToUser(toUserId, 'call:hangup', {
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

    socket.on('disconnect', () => {
      if (!isAuthenticatedUser(userId)) return;
      const state = presenceService.markOffline(userId, socket.id);
      notifyPresenceChange(state);
    });
  });
}

module.exports = { registerChatGateway };
