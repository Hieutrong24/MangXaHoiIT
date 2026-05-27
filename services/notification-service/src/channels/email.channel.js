const mailer = require('../integrations/mailer');

module.exports = {
  async send(notification) {
    await mailer.sendMail({
      to: notification.data?.recipientEmail || 'student@example.com',
      subject: notification.title,
      text: notification.body,
    });
    return { channel: 'email', success: true };
  },
};
