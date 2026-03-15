// src/events/message-sent.event.js
const { EventEmitter } = require("events");

const EVENT_MESSAGE_SENT = "chat.message.sent";

const eventBus = new EventEmitter();
eventBus.setMaxListeners(50);

function emitMessageSent(payload) {
  eventBus.emit(EVENT_MESSAGE_SENT, payload);
}

function onMessageSent(handler) {
  eventBus.on(EVENT_MESSAGE_SENT, handler);
}

module.exports = {
  EVENT_MESSAGE_SENT,
  eventBus,
  emitMessageSent,
  onMessageSent
};
