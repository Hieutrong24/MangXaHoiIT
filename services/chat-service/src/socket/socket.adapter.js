// src/socket/socket.adapter.js
const { Server } = require("socket.io");

function createSocketServer(httpServer, { corsOrigin = "*" } = {}) {
  const io = new Server(httpServer, {
    cors: {
      origin: corsOrigin,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const userId =
      socket.handshake.auth?.userId ||
      socket.handshake.query?.userId ||
      socket.handshake.headers["x-user-id"] ||
      socket.handshake.headers["x-userid"];

    socket.data.userId = userId ? String(userId) : null;
    next();
  });

  return io;
}

function getUserId(socket) {
  return socket.data.userId || "anonymous";
}

module.exports = { createSocketServer, getUserId };
