// src/integrations/websocket.js
const { env } = require("../config/env");

let ioClient = null;
try {
  ioClient = require("socket.io-client");
} catch {
  // optional
}

function createWebsocket(logger) {
  if (!env.WS_ENABLED) {
    return {
      enabled: false,
      async notify() {
        return { ok: true, skipped: true, reason: "WS_DISABLED" };
      },
      stop() {},
    };
  }

  if (!env.WS_URL) {
    // Không có WS_URL thì vẫn “ok” (no-op)
    return {
      enabled: false,
      async notify() {
        return { ok: true, skipped: true, reason: "WS_URL_EMPTY" };
      },
      stop() {},
    };
  }

  if (!ioClient) {
    throw new Error("WS_ENABLED=true but socket.io-client is not installed. Run: npm i socket.io-client");
  }

  const socket = ioClient(env.WS_URL, {
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 500,
    reconnectionAttempts: Infinity,
  });

  socket.on("connect", () => logger?.info?.(`[ws] connected ${env.WS_URL} sid=${socket.id}`));
  socket.on("connect_error", (e) => logger?.warn?.(`[ws] connect_error: ${e?.message || e}`));
  socket.on("disconnect", (r) => logger?.warn?.(`[ws] disconnected: ${r}`));

  return {
    enabled: true,
    async notify({ userId, notification }) {
      if (!userId) return { ok: false, error: "USER_ID_REQUIRED" };
      socket.emit(env.WS_EVENT_NAME, { userId, notification });
      return { ok: true };
    },
    stop() {
      try {
        socket.close();
      } catch {}
    },
  };
}

module.exports = { createWebsocket };
