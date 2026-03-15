const EXCHANGES = {
  EVENTS: process.env.RABBIT_EXCHANGE || "events",
};

const ROUTING_KEYS = {
  CHAT_MESSAGE_SENT: "chat.message.sent",
};

module.exports = {
  EXCHANGES,
  ROUTING_KEYS,
};