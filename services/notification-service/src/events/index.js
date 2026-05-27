const eventNames = require("./event.names");
const commentCreatedHandler = require("./handlers/comment-created.handler");
const friendRequestSentHandler = require("./handlers/friend-request-sent.handler");
const friendRequestAcceptedHandler = require("./handlers/friend-request-accepted.handler");
const messageSentHandler = require("./handlers/message-sent.handler");
const codeResultHandler = require("./handlers/code-result.handler");
const userLoggedInHandler = require("./handlers/user-logged-in.handler");

let handlers = {};

function init() {
  handlers = {
    [eventNames.COMMENT_CREATED]: commentCreatedHandler,
    [eventNames.FRIEND_REQUEST_SENT]: friendRequestSentHandler,
    [eventNames.FRIEND_REQUEST_ACCEPTED]: friendRequestAcceptedHandler,
    [eventNames.MESSAGE_SENT]: messageSentHandler,
    [eventNames.CODE_RESULT_READY]: codeResultHandler,
    [eventNames.AUTH_USER_LOGGED_IN]: userLoggedInHandler,
  };
}

function getEventNames() {
  return Object.keys(handlers);
}

async function handle(eventName, payload) {
  const handler = handlers[eventName];

  if (!handler) {
    console.warn(`[events] no handler registered for ${eventName}`);
    return;
  }

  await handler(payload);
}

module.exports = {
  init,
  getEventNames,
  handle,
};
