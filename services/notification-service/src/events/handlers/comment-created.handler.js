const notificationService = require('../../modules/notification/notification.service');
const { CHANNELS, NOTIFICATION_TYPES } = require('../../config/constants');

module.exports = async function handleCommentCreated(event) {
  const recipientId = event.postOwnerId;
  if (!recipientId || recipientId === event.commenterId) return null;

  return notificationService.createNotification({
    recipientId,
    actorId: event.commenterId,
    actorName: event.commenterName,
    type: NOTIFICATION_TYPES.COMMENT_CREATED,
    title: 'Bài viết của bạn có bình luận mới',
    body: `${event.commenterName || 'Một người dùng'} vừa bình luận vào bài viết của bạn lúc ${new Date().toLocaleString('vi-VN')}.`,
    channels: [CHANNELS.IN_APP, CHANNELS.REALTIME, CHANNELS.EMAIL],
    data: {
      postId: event.postId,
      commentId: event.commentId,
      postTitle: event.postTitle,
      recipientEmail: event.postOwnerEmail,
      actorName: event.commenterName,
      occurredAt: event.occurredAt || new Date().toISOString(),
    },
  });
};
