import { io } from 'socket.io-client';
import { getCurrentUserId } from '../../../shared/utils/currentUser';
import { attachArchitectureSocketMonitor } from '../../../architecture/socketMonitor';

const wsBaseUrl =
  import.meta.env.VITE_NOTIFICATION_WS_URL ||
  'http://localhost:5010';

let socketInstance = null;
let socketUserId = null;

export function getNotificationSocket() {
  const userId = getCurrentUserId();
  if (!userId) return null;

  if (socketInstance && socketUserId === String(userId)) {
    return socketInstance;
  }

  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }

  socketInstance = io(wsBaseUrl, {
    transports: ['websocket', 'polling'],
    autoConnect: true,
    auth: { userId: String(userId) },
    query: { userId: String(userId) },
  });
  attachArchitectureSocketMonitor(socketInstance, 'notification');
  socketUserId = String(userId);

  return socketInstance;
}

export function disconnectNotificationSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
    socketUserId = null;
  }
}
