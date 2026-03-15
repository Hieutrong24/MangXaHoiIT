// src/config/constants.js
const SERVICE_NAMES = Object.freeze({
  AUTH: "auth-service",
  USER: "user-service",
  CODEJUDGE: "code-judge-service",
  CONTENT: "content-service",
  CHAT: "chat-service",
});

const HEADER = Object.freeze({
  CORRELATION_ID: "x-correlation-id",
  FORWARDED_FOR: "x-forwarded-for",
  USER_ID: "x-user-id",
  USER_ROLES: "x-user-roles",

});

module.exports = { SERVICE_NAMES, HEADER };
