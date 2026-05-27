const notificationService = require('../../modules/notification/notification.service');
const { CHANNELS, NOTIFICATION_TYPES } = require('../../config/constants');

module.exports = async function handleMessageSent(event) {
  const basePayload = {
    recipientId: event.receiverId,
    actorId: event.senderId,
    actorName: event.senderName,
    type: NOTIFICATION_TYPES.MESSAGE_SENT,
    title: 'Tin nhắn mới',
    channels: event.isRecipientOnline
      ? [CHANNELS.IN_APP, CHANNELS.REALTIME]
      : [CHANNELS.IN_APP, CHANNELS.REALTIME, CHANNELS.PUSH],
    data: {
      conversationId: event.conversationId,
      preview: event.preview,
      actorName: event.senderName,
      occurredAt: event.occurredAt || new Date().toISOString(),
    },
  };

  return notificationService.createNotification({
    ...basePayload,
    body: event.preview
      ? `${event.senderName || 'Một người dùng'}: ${event.preview} (${new Date().toLocaleString('vi-VN')})`
      : `${event.senderName || 'Một người dùng'} đã gửi cho bạn một tin nhắn mới lúc ${new Date().toLocaleString('vi-VN')}.`,
  });
};
