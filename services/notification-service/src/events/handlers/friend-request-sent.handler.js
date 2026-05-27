const notificationService = require('../../modules/notification/notification.service');
const { CHANNELS, NOTIFICATION_TYPES } = require('../../config/constants');

module.exports = async function handleFriendRequestSent(event) {
  return notificationService.createNotification({
    recipientId: event.toUserId,
    actorId: event.fromUserId,
    actorName: event.senderName,
    type: NOTIFICATION_TYPES.FRIEND_REQUEST_SENT,
    title: 'Bạn có lời mời kết bạn mới',
    body: `${event.senderName || 'Một người dùng'} đã gửi cho bạn lời mời kết bạn lúc ${new Date().toLocaleString('vi-VN')}.`,
    channels: [CHANNELS.IN_APP, CHANNELS.REALTIME, CHANNELS.EMAIL],
    data: {
      senderId: event.fromUserId,
      senderName: event.senderName,
      recipientEmail: event.receiverEmail,
      occurredAt: event.occurredAt || new Date().toISOString(),
    },
  });
};
