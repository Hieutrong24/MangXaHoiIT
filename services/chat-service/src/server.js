require("dotenv").config();

const http = require("http");
const express = require("express");
const cors = require("cors");

const { connectMongo, disconnectMongo } = require("./config/db");
const { connectRabbit, disconnectRabbit } = require("./config/rabbitmq");
const { createSocketServer, getUserId } = require("./socket/socket.adapter");

const chatService = require("./modules/chat/chat.service");
const { buildChatRouter } = require("./modules/chat/chat.controller");
const { registerChatGateway } = require("./modules/chat/chat.gateway");
const { registerMessageSentHandler } = require("./events/message-sent.handler");

const PORT = Number(process.env.PORT || 5004);
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/chat_service";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";
const NODE_ENV = process.env.NODE_ENV || "development";

let serverInstance = null;
let ioInstance = null;
let shuttingDown = false;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connectRabbitWithRetry({
  retries = 15,
  delayMs = 4000,
} = {}) {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await connectRabbit();
      console.log("[chat-service] rabbitmq connected");
      return;
    } catch (error) {
      lastError = error;
      console.error(
        `[chat-service] rabbitmq connect failed (${attempt}/${retries}):`,
        error?.message || error
      );

      if (attempt < retries) {
        console.log(
          `[chat-service] retrying rabbitmq in ${delayMs}ms...`
        );
        await sleep(delayMs);
      }
    }
  }

  throw lastError;
}

function buildApp() {
  const app = express();

  app.use(
    cors({
      origin: CORS_ORIGIN === "*" ? true : CORS_ORIGIN,
      credentials: true,
    })
  );

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.get("/api/health", (_req, res) => {
    res.status(200).json({
      service: "chat-service",
      status: "ok",
      env: NODE_ENV,
      rabbitmq: "connected",
      mongodb: "connected",
    });
  });

  app.use("/api", buildChatRouter({ chatService }));

  app.use((req, res) => {
    res.status(404).json({
      error: "Route not found",
      method: req.method,
      path: req.originalUrl,
    });
  });

  app.use((err, _req, res, _next) => {
    console.error("[chat-service] express error:", err);
    res.status(500).json({
      error: "Internal Server Error",
    });
  });

  return app;
}

async function main() {
  await connectMongo(MONGO_URI);
  console.log("[chat-service] mongo connected");

  await connectRabbitWithRetry({
    retries: 15,
    delayMs: 4000,
  });

  const app = buildApp();
  const server = http.createServer(app);

  server.on("error", (err) => {
    console.error("[chat-service] server error:", err);
  });

  const io = createSocketServer(server, {
    corsOrigin: CORS_ORIGIN,
  });

  registerMessageSentHandler({ io });
  registerChatGateway({ io, chatService, getUserId });

  await new Promise((resolve) => {
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`[chat-service] listening on port ${PORT}`);
      console.log("[chat-service] health: /api/health");
      console.log(`[chat-service] env: ${NODE_ENV}`);
      resolve();
    });
  });

  serverInstance = server;
  ioInstance = io;
}

async function shutdown(reason) {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log(`[chat-service] shutdown requested by: ${reason}`);

  try {
    if (ioInstance) {
      ioInstance.close();
      console.log("[chat-service] socket closed");
    }
  } catch (e) {
    console.warn("[chat-service] socket close warning:", e?.message);
  }

  try {
    if (serverInstance) {
      await new Promise((resolve) => {
        serverInstance.close(() => {
          console.log("[chat-service] http closed");
          resolve();
        });
      });
    }
  } catch (e) {
    console.warn("[chat-service] http close warning:", e?.message);
  }

  try {
    await disconnectRabbit();
    console.log("[chat-service] rabbitmq disconnected");
  } catch (e) {
    console.warn("[chat-service] rabbitmq disconnect warning:", e?.message);
  }

  try {
    await disconnectMongo();
    console.log("[chat-service] mongo disconnected");
  } catch (e) {
    console.warn("[chat-service] mongo disconnect warning:", e?.message);
  }

  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGBREAK", () => shutdown("SIGBREAK"));

process.on("uncaughtException", (e) => {
  console.error("[chat-service] uncaughtException:", e);
});

process.on("unhandledRejection", (e) => {
  console.error("[chat-service] unhandledRejection:", e);
});

process.stdin.resume();

main().catch((e) => {
  console.error("[chat-service] startup failed:", e);
  process.exit(1);
});