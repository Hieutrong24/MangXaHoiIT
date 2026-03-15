const email = require('./email.channel');
const push = require('./push.channel');
const inapp = require('./inapp.channel');
const realtime = require('./websocket.channel');

const handlers = {
  email,
  push,
  inapp,
  realtime,
};

module.exports = {
  async deliver(channel, notification) {
    const handler = handlers[channel];
    if (!handler) {
      return { channel, success: false, error: `Unsupported channel: ${channel}` };
    }

    try {
      return await handler.send(notification);
    } catch (error) {
      return { channel, success: false, error: error.message };
    }
  },
};
