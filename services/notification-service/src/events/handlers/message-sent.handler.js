const notificationService = require('../../modules/notification/notification.service');
const { CHANNELS, NOTIFICATION_TYPES } = require('../../config/constants');

module.exports = async function handleMessageSent(event) {
  if (event.isRecipientOnline) {
    return notificationService.createNotification({
      recipientId: event.receiverId,
      actorId: event.senderId,
      type: NOTIFICATION_TYPES.MESSAGE_SENT,
      title: 'Tin nhắn mới',
      body: `${event.senderName || 'Một người dùng'}: ${event.preview || 'Đã gửi cho bạn một tin nhắn mới.'}`,
      channels: [CHANNELS.IN_APP, CHANNELS.REALTIME],
      data: {
        conversationId: event.conversationId,
      },
    });
  }

  return notificationService.createNotification({
    recipientId: event.receiverId,
    actorId: event.senderId,
    type: NOTIFICATION_TYPES.MESSAGE_SENT,
    title: 'Tin nhắn mới',
    body: `${event.senderName || 'Một người dùng'} đã gửi cho bạn một tin nhắn mới.`,
    channels: [CHANNELS.IN_APP, CHANNELS.REALTIME, CHANNELS.PUSH],
    data: {
      conversationId: event.conversationId,
    },
  });
};
