// src/server.js
require("dotenv").config();

const http = require("http");
const express = require("express");
const cors = require("cors");

const { connectMongo, disconnectMongo } = require("./config/db");
const { createSocketServer, getUserId } = require("./socket/socket.adapter");

const chatService = require("./modules/chat/chat.service");
const { buildChatRouter } = require("./modules/chat/chat.controller");
const { registerChatGateway } = require("./modules/chat/chat.gateway");
const { registerMessageSentHandler } = require("./events/message-sent.handler");

async function main() {
  const PORT = process.env.PORT || 4000;
  const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/chat_service";
  const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";
  const NODE_ENV = process.env.NODE_ENV || "development";
  const isProd = NODE_ENV === "production";

  await connectMongo(MONGO_URI);

  const app = express();
  app.use(cors({ origin: CORS_ORIGIN }));
  app.use(express.json({ limit: "1mb" }));
  app.use("/api", buildChatRouter({ chatService }));

  const server = http.createServer(app);

  server.on("error", (err) => {
    console.error("[chat-service] server error:", err);
  });

  const io = createSocketServer(server, { corsOrigin: CORS_ORIGIN });

  registerMessageSentHandler({ io });
  registerChatGateway({ io, chatService, getUserId });

  server.listen(PORT, () => {
    console.log(`[chat-service] listening on http://localhost:${PORT}`);
    console.log(`[chat-service] endpoints: /api/health`);
    console.log(`[chat-service] socket: ws://localhost:${PORT}`);
    console.log(`[chat-service] env: ${NODE_ENV}`);
  });

  let shuttingDown = false;

  const shutdown = async (reason) => {
    if (shuttingDown) return;
    shuttingDown = true;

    console.log(`[chat-service] shutdown requested by: ${reason}`);
    try {
      io.close();
    } catch {}

    await new Promise((resolve) => {
      server.close(() => {
        console.log("[chat-service] http closed");
        resolve();
      });
    });


    await disconnectMongo();
    console.log("[chat-service] mongo disconnected");

    if (isProd) process.exit(0);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGBREAK", () => shutdown("SIGBREAK"));
  if (isProd) {
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } else {
    process.on("SIGTERM", () => {
      console.warn("[chat-service] SIGTERM received (ignored in dev).");
    });
  }

  process.on("uncaughtException", (e) => {
    console.error("[chat-service] uncaughtException:", e);
  });

  process.on("unhandledRejection", (e) => {
    console.error("[chat-service] unhandledRejection:", e);
  });

  process.stdin.resume();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
