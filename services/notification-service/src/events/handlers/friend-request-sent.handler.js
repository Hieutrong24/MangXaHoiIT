const notificationService = require('../../modules/notification/notification.service');
const { CHANNELS, NOTIFICATION_TYPES } = require('../../config/constants');

module.exports = async function handleFriendRequestSent(event) {
  return notificationService.createNotification({
    recipientId: event.receiverId,
    actorId: event.senderId,
    type: NOTIFICATION_TYPES.FRIEND_REQUEST_SENT,
    title: 'Bạn có lời mời kết bạn mới',
    body: `${event.senderName || 'Một người dùng'} đã gửi cho bạn lời mời kết bạn.`,
    channels: [CHANNELS.IN_APP, CHANNELS.REALTIME, CHANNELS.EMAIL],
    data: {
      senderId: event.senderId,
      recipientEmail: event.receiverEmail,
    },
  });
};
