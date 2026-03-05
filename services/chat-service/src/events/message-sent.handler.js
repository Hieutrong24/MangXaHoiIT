// src/events/message-sent.handler.js
const { onMessageSent } = require("./message-sent.event");

/**
 * Handler side-effects:
 * - emit ra socket room chatId
 * - (sau này có thể publish Kafka/Rabbit, push notification...)
 */
function registerMessageSentHandler({ io }) {
  if (!io) throw new Error("io is required");

  onMessageSent((evt) => {
    // evt: { chatId, message }
    const { chatId, message } = evt || {};
    if (!chatId || !message) return;

    io.to(chatId).emit("message:new", {
      chatId,
      message
    });
  });
}

module.exports = { registerMessageSentHandler };
