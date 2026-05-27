const push = require('../integrations/push');

module.exports = {
  async send(notification) {
    await push.send({
      userId: notification.recipientId,
      title: notification.title,
      body: notification.body,
      data: notification.data,
    });
    return { channel: 'push', success: true };
  },
};
