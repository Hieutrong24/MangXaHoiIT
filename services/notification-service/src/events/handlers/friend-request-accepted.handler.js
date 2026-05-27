const notificationService = require('../../modules/notification/notification.service');
const { CHANNELS, NOTIFICATION_TYPES } = require('../../config/constants');

module.exports = async function handleFriendRequestAccepted(event) {
  return notificationService.createNotification({
    recipientId: event.fromUserId,
    actorId: event.toUserId,
    actorName: event.receiverName,
    type: NOTIFICATION_TYPES.FRIEND_REQUEST_ACCEPTED,
    title: 'Lời mời kết bạn đã được chấp nhận',
    body: `${event.receiverName || 'Một người dùng'} đã chấp nhận lời mời kết bạn của bạn.`,
    channels: [CHANNELS.IN_APP, CHANNELS.REALTIME],
    data: {
      requestId: event.requestId,
      fromUserId: event.fromUserId,
      toUserId: event.toUserId,
      actorId: event.toUserId,
      actorName: event.receiverName,
      occurredAt: event.acceptedAt || new Date().toISOString(),
    },
  });
};
