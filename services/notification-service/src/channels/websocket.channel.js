const websocket = require('../integrations/websocket');

module.exports = {
  async send(notification) {
    websocket.emitToUser(notification.recipientId, 'notification:new', notification);
    return { channel: 'realtime', success: true };
  },
};
