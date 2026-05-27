import { createCallSignaling } from './call.signaling';
import { createSocketClient, disconnectChatSocket } from '../socket/socketClient';

let manager = null;
let managerUserId = null;
let listeners = new Set();
let currentState = null;

function emit(next) {
  currentState = next;
  listeners.forEach((listener) => {
    try {
      listener(currentState);
    } catch (error) {
      console.error('[callManager] listener error:', error);
    }
  });
}

function disposeManager() {
  if (manager) {
    try {
      manager.dispose?.();
    } catch {}
  }
  manager = null;
  managerUserId = null;
  currentState = null;
}

export function initCallManager({ token, userId }) {
  const normalizedUserId = String(userId || '').trim();
  if (!normalizedUserId || !token) {
    disposeManager();
    disconnectChatSocket();
    return null;
  }

  if (manager && managerUserId === normalizedUserId) {
    return manager;
  }

  disposeManager();

  const socket = createSocketClient({ token, userId: normalizedUserId });
  manager = createCallSignaling({
    socket,
    currentUserId: normalizedUserId,
    onState: emit,
  });
  managerUserId = normalizedUserId;
  return manager;
}

export function getCallManager() {
  return manager;
}

export function subscribeCallState(listener) {
  if (typeof listener !== 'function') return () => {};
  listeners.add(listener);
  listener(currentState);

  return () => {
    listeners.delete(listener);
  };
}

export function getCallState() {
  return currentState;
}

export function resetCallManager() {
  disposeManager();
}
