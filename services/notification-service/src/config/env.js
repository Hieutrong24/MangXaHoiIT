// src/config/env.js
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: process.env.ENV_FILE || path.resolve(process.cwd(), ".env") });

function toInt(v, def) {
  const n = parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) ? n : def;
}
function toBool(v, def) {
  if (v === undefined || v === null) return def;
  const s = String(v).toLowerCase();
  return s === "1" || s === "true" || s === "yes";
}

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: toInt(process.env.PORT, 4000),

  // broker
  BROKER_DRIVER: process.env.BROKER_DRIVER || "inmemory", // inmemory | rabbitmq
  RABBIT_URL: process.env.RABBIT_URL || "amqp://localhost:5672",
  RABBIT_EXCHANGE: process.env.RABBIT_EXCHANGE || "events",
  RABBIT_QUEUE: process.env.RABBIT_QUEUE || "notification-service",
  RABBIT_PREFETCH: toInt(process.env.RABBIT_PREFETCH, 10),

  // mailer (SMTP)
  SMTP_ENABLED: toBool(process.env.SMTP_ENABLED, false),
  SMTP_HOST: process.env.SMTP_HOST || "",
  SMTP_PORT: toInt(process.env.SMTP_PORT, 587),
  SMTP_SECURE: toBool(process.env.SMTP_SECURE, false),
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",
  MAIL_FROM: process.env.MAIL_FROM || "no-reply@local",

  // websocket integration (emit notify to another websocket gateway if you want)
  WS_ENABLED: toBool(process.env.WS_ENABLED, true),
  WS_URL: process.env.WS_URL || "", // example: http://localhost:3000
  WS_EVENT_NAME: process.env.WS_EVENT_NAME || "notify", // event to emit
};

module.exports = { env };
