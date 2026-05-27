const { onMessageSent } = require('./message-sent.event');
const { publishChatMessageSent, publishMessageSentNotification } = require('../messaging/chat.publisher');

function userRoom(userId) {
  return `user:${String(userId)}`;
}

function parseDmPeerIds(chatId) {
  try {
    const s = String(chatId || '');
    if (!s.startsWith('dm:')) return null;
    const parts = s.split(':');
    if (parts.length !== 3) return null;
    return { a: parts[1], b: parts[2] };
  } catch {
    return null;
  }
}

function uniqueIds(input = []) {
  return [...new Set(input.map((item) => String(item || '').trim()).filter(Boolean))];
}

function previewOf(message) {
  if (message?.type === 'file') {
    const first = Array.isArray(message?.meta?.attachments) ? message.meta.attachments[0] : null;
    const rawFileName = String(first?.filename || message?.content || 'Tệp đính kèm').trim();
    return `📎 ${rawFileName}`;
  }

  const raw = String(message?.content || '').trim();
  if (!raw) return 'Bạn có tin nhắn mới.';
  return raw.length > 120 ? `${raw.slice(0, 117)}...` : raw;
}

function resolveRecipientIds(chatId, message) {
  const dm = parseDmPeerIds(chatId);
  if (dm) {
    return [dm.a, dm.b].filter((id) => id && id !== String(message.senderId));
  }

  const metaRecipients = Array.isArray(message?.meta?.recipientIds)
    ? message.meta.recipientIds
    : [];

  return uniqueIds(metaRecipients.filter((id) => String(id) !== String(message.senderId)));
}

function registerMessageSentHandler({ io, presenceService }) {
  if (!io) throw new Error('io is required');
  if (!presenceService) throw new Error('presenceService is required');

  const emitRealtimeMessage = (target, payload) => {
    target.emit('message:new', payload);
    target.emit('chat:new-message', payload);
  };

  onMessageSent(async (evt) => {
    try {
      const { chatId, message } = evt || {};
      if (!chatId || !message) return;

      emitRealtimeMessage(io.to(chatId), { chatId, message });

      const recipientIds = resolveRecipientIds(chatId, message);
      if (recipientIds.length > 0) {
        recipientIds.forEach((recipientId) => {
          emitRealtimeMessage(io.to(userRoom(recipientId)), { chatId, message });
        });
      } else if (message.senderId) {
        emitRealtimeMessage(io.to(userRoom(message.senderId)), { chatId, message });
      }

      await publishChatMessageSent(evt);

      if (message.type === 'system' || message?.meta?.silent) return;

      await Promise.all(
        recipientIds.map((recipientId) =>
          publishMessageSentNotification({
            conversationId: chatId,
            receiverId: recipientId,
            senderId: message.senderId,
            senderName: message?.meta?.senderName || message?.meta?.authorName || null,
            preview: previewOf(message),
            messageId: message.id,
            isRecipientOnline: presenceService.isOnline(recipientId),
          })
        )
      );
    } catch (e) {
      console.error('[chat.message.sent.handler] error:', e);
    }
  });
}

module.exports = { registerMessageSentHandler };
