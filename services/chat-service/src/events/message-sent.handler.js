// src/events/message-sent.handler.js
const { onMessageSent } = require("./message-sent.event");


function registerMessageSentHandler({ io }) {
  if (!io) throw new Error("io is required");

  onMessageSent((evt) => {
   
    const { chatId, message } = evt || {};
    if (!chatId || !message) return;

    io.to(chatId).emit("message:new", {
      chatId,
      message
    });
  });
}

module.exports = { registerMessageSentHandler };
