// src/features/chat/socket/socketClient.js
import { io } from "socket.io-client";

// Chat-service socket URL (port 4000)
const SOCKET_URL = import.meta.env.VITE_CHAT_SOCKET_URL || "http://localhost:4000";

/**
 * createSocketClient({ token, userId })
 * - token: JWT
 * - userId: optional, giúp debug / fallback
 */
export function createSocketClient({ token, userId }) {
  const socket = io(SOCKET_URL, {
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 500,
    auth: {
      token,
      userId, // optional
    },
  });

  return socket;
}