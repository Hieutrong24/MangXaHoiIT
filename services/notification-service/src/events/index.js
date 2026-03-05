// src/events/index.js
const { EVENTS } = require("../config/constants");
const { handleCodeResult } = require("./code-result.handler");
const { handlePostCreated } = require("./post-created.handler");

function createEventDispatcher({ notificationService, logger }) {
  async function dispatch(msg) {
    const type = msg?.type;
    const payload = msg?.payload;

    if (!type) throw new Error("event.type required");

    switch (type) {
      case EVENTS.CODE_RESULT:
        return handleCodeResult({ payload, notificationService, logger });

      case EVENTS.POST_CREATED:
        return handlePostCreated({ payload, notificationService, logger });

      default:
        logger?.warn?.(`[events] unknown type=${type} -> ignored`);
        return null;
    }
  }

  return { dispatch };
}

async function registerHandlers({ broker, dispatcher, logger }) {
  await broker.subscribe(async (msg) => {
    try {
      await dispatcher.dispatch(msg);
    } catch (e) {
      logger?.error?.(`[events] dispatch error type=${msg?.type}: ${e?.message || e}`);
    }
  });

  logger?.info?.("[events] handlers registered");
}

module.exports = { createEventDispatcher, registerHandlers };
