const notificationService = require('../../modules/notification/notification.service');
const { CHANNELS, NOTIFICATION_TYPES } = require('../../config/constants');

module.exports = async function handleCodeResult(event) {
  return notificationService.createNotification({
    recipientId: event.userId,
    actorId: 'code-judge-service',
    type: NOTIFICATION_TYPES.CODE_RESULT,
    title: 'Kết quả chấm bài đã sẵn sàng',
    body: `Bài nộp của bạn vừa được chấm với kết quả: ${event.verdict || 'N/A'}.`,
    channels: [CHANNELS.IN_APP, CHANNELS.REALTIME, CHANNELS.EMAIL],
    data: {
      submissionId: event.submissionId,
      problemId: event.problemId,
      recipientEmail: event.userEmail,
    },
  });
};
