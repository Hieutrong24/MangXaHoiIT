// src/socket/socket.adapter.js
const { Server } = require("socket.io");

function createSocketServer(httpServer, { corsOrigin = "*" } = {}) {
  const io = new Server(httpServer, {
    cors: {
      origin: corsOrigin,
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.use((socket, next) => {
    const userId =
      socket.handshake.auth?.userId ||
      socket.handshake.headers["x-user-id"] ||
      socket.handshake.headers["x-userid"];

    if (!userId) {
      socket.data.userId = null;
    } else {
      socket.data.userId = String(userId);
    }

    next();
  });

  return io;
}

function getUserId(socket) {
  return socket.data.userId || "anonymous";
}

module.exports = { createSocketServer, getUserId };
