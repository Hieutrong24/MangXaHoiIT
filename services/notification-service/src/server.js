// src/server.js
const http = require("http");
const { env } = require("./config/env");
const { createBroker } = require("./integrations/broker");
const { createMailer } = require("./integrations/mailer");
const { createPush } = require("./integrations/push");
const { createWebsocket } = require("./integrations/websocket");
const { createNotificationService } = require("./services/notification.service");
const { createEventDispatcher, registerHandlers } = require("./events/index");
const { buildApp } = require("./app");

function createLogger() {
  return {
    info: (...a) => console.log(...a),
    warn: (...a) => console.warn(...a),
    error: (...a) => console.error(...a),
  };
}

async function main() {
  const logger = createLogger();

  const broker = createBroker(logger);
  const mailer = createMailer(logger);
  const push = createPush(logger);
  const websocket = createWebsocket(logger);

  const notificationService = createNotificationService({ mailer, push, websocket, logger });

  const dispatcher = createEventDispatcher({ notificationService, logger });
  const app = buildApp({ dispatcher });
  const server = http.createServer(app);

  await broker.start();
  await registerHandlers({ broker, dispatcher, logger });

  server.listen(env.PORT, () => {
    logger.info(`[notification-service] listening http://localhost:${env.PORT}`);
    logger.info(`[notification-service] broker=${broker.driver} env=${env.NODE_ENV}`);
    logger.info(`[notification-service] endpoints: GET /health | POST /events`);
  });

  let stopping = false;
  const shutdown = async (reason) => {
    if (stopping) return;
    stopping = true;
    logger.warn(`[notification-service] shutdown: ${reason}`);

    await new Promise((resolve) => server.close(resolve));
    try { websocket.stop?.(); } catch {}
    try { await broker.stop(); } catch {}

    process.exit(0);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
