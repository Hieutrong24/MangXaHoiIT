const EXCHANGES = {
  EVENTS: process.env.RABBIT_EXCHANGE || "events",
};

const ROUTING_KEYS = {
  CHAT_MESSAGE_SENT: "chat.message.sent",
  MESSAGE_SENT: "message.sent",
  CALL_INVITED: "call.invited",
  USER_ONLINE: "user.online",
  USER_OFFLINE: "user.offline",
};

module.exports = {
  EXCHANGES,
  ROUTING_KEYS,
};
