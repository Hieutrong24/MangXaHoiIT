const { getRabbitChannel } = require("../config/rabbitmq");
const { EXCHANGES, ROUTING_KEYS } = require("./topics");

function publish(eventName, data) {
  const ch = getRabbitChannel();
  if (!ch) {
    console.warn(`[rabbitmq] no channel, skip publish ${eventName}`);
    return false;
  }

  const payload = {
    eventName,
    occurredAt: new Date().toISOString(),
    data,
  };

  const ok = ch.publish(
    EXCHANGES.EVENTS,
    eventName,
    Buffer.from(JSON.stringify(payload)),
    {
      contentType: "application/json",
      persistent: true,
    }
  );

  if (ok) {
    console.log("[rabbitmq] published:", eventName);
  }

  return ok;
}

function publishChatMessageSent(evt) {
  return publish(ROUTING_KEYS.CHAT_MESSAGE_SENT, {
    chatId: evt.chatId,
    message: evt.message,
  });
}

function publishMessageSentNotification(evt) {
  return publish(ROUTING_KEYS.MESSAGE_SENT, evt);
}

function publishCallInvited(evt) {
  return publish(ROUTING_KEYS.CALL_INVITED, evt);
}

function publishUserOnline(evt) {
  return publish(ROUTING_KEYS.USER_ONLINE, evt);
}

function publishUserOffline(evt) {
  return publish(ROUTING_KEYS.USER_OFFLINE, evt);
}

module.exports = {
  publish,
  publishChatMessageSent,
  publishMessageSentNotification,
  publishCallInvited,
  publishUserOnline,
  publishUserOffline,
};
