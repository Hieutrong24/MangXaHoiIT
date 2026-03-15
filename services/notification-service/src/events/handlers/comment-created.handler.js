const notificationService = require('../../modules/notification/notification.service');
const { CHANNELS, NOTIFICATION_TYPES } = require('../../config/constants');

module.exports = async function handleCommentCreated(event) {
  const recipientId = event.postOwnerId;
  if (!recipientId || recipientId === event.commenterId) return null;

  return notificationService.createNotification({
    recipientId,
    actorId: event.commenterId,
    type: NOTIFICATION_TYPES.COMMENT_CREATED,
    title: 'Bài viết của bạn có bình luận mới',
    body: `${event.commenterName || 'Một người dùng'} vừa bình luận vào bài viết của bạn.`,
    channels: [CHANNELS.IN_APP, CHANNELS.REALTIME, CHANNELS.EMAIL],
    data: {
      postId: event.postId,
      commentId: event.commentId,
      recipientEmail: event.postOwnerEmail,
    },
  });
};
