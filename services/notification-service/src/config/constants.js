module.exports = {
  CHANNELS: {
    IN_APP: 'inapp',
    EMAIL: 'email',
    PUSH: 'push',
    REALTIME: 'realtime',
  },
  NOTIFICATION_TYPES: {
    COMMENT_CREATED: 'comment_created',
    FRIEND_REQUEST_SENT: 'friend_request_sent',
    MESSAGE_SENT: 'message_sent',
    CODE_RESULT: 'code_result',
    SYSTEM: 'system',
  },
  DELIVERY_STATUS: {
    PENDING: 'pending',
    SUCCESS: 'success',
    FAILED: 'failed',
    SKIPPED: 'skipped',
  },
  NOTIFICATION_STATUS: {
    PENDING: 'pending',
    DELIVERED: 'delivered',
    PARTIAL: 'partial',
    FAILED: 'failed',
  },
};
