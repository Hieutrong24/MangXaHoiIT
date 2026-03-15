const { getRabbitChannel } = require("../config/rabbitmq");
const { EXCHANGES, ROUTING_KEYS } = require("./topics");

async function publishMessageSent(evt) {
  const ch = getRabbitChannel();
  if (!ch) {
    console.warn("[rabbitmq] no channel, skip publish chat.message.sent");
    return false;
  }

  const payload = {
    eventName: ROUTING_KEYS.CHAT_MESSAGE_SENT,
    occurredAt: new Date().toISOString(),
    data: {
      chatId: evt.chatId,
      message: evt.message,
    },
  };

  const ok = ch.publish(
    EXCHANGES.EVENTS,
    ROUTING_KEYS.CHAT_MESSAGE_SENT,
    Buffer.from(JSON.stringify(payload)),
    {
      contentType: "application/json",
      persistent: true,
    }
  );

  if (ok) {
    console.log("[rabbitmq] published:", ROUTING_KEYS.CHAT_MESSAGE_SENT);
  }

  return ok;
}

module.exports = {
  publishMessageSent,
};