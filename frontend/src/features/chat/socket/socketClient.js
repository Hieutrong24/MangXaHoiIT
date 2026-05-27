import { io } from 'socket.io-client';
import { attachArchitectureSocketMonitor } from '../../../architecture/socketMonitor';

const SOCKET_URL = import.meta.env.VITE_CHAT_SOCKET_URL || 'http://localhost:5004';

let socketInstance = null;
let socketUserId = null;

export function createSocketClient({ token, userId }) {
  const normalizedUserId = String(userId || '').trim();

  if (!normalizedUserId) return null;

  if (socketInstance && socketUserId === normalizedUserId) {
    return socketInstance;
  }

  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }

  socketInstance = io(SOCKET_URL, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 500,
    auth: {
      token,
      userId: normalizedUserId,
    },
    query: {
      userId: normalizedUserId,
    },
  });

  attachArchitectureSocketMonitor(socketInstance, 'chat');
  socketUserId = normalizedUserId;
  return socketInstance;
}

export function getChatSocket() {
  return socketInstance;
}

export function disconnectChatSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
    socketUserId = null;
  }
}
