import { createCorrelationId, emitArchitectureLog, emitSocketStatus } from './monitorBus';
import { getSocketArchitecture } from './architectureMap';

function socketLevel(eventName) {
  return /error|disconnect|failed/i.test(String(eventName || '')) ? 'warning' : 'realtime';
}

function logSocketEvent({ eventName, direction, elapsed, status = 'near realtime', socket }) {
  const architecture = getSocketArchitecture(eventName);
  emitArchitectureLog({
    type: architecture.broker ? 'Event' : 'WebSocket',
    level: socketLevel(eventName),
    eventName,
    method: direction,
    endpoint: socket?.io?.uri || socket?.nsp || 'Socket.IO',
    service: architecture.service,
    protocol: architecture.protocol,
    database: architecture.database,
    broker: architecture.broker,
    statusCode: socket?.connected ? 'CONNECTED' : 'PENDING',
    responseTimeMs: Number.isFinite(elapsed) ? elapsed : undefined,
    correlationId: createCorrelationId('socket'),
    userAction: architecture.userAction,
    result: status || architecture.result,
  });
}

export function attachArchitectureSocketMonitor(socket, label = 'Socket.IO') {
  if (!socket || socket.__architectureMonitorAttached) return socket;
  socket.__architectureMonitorAttached = true;
  socket.__architectureOriginalEmit = socket.emit?.bind(socket);
  socket.__architectureOriginalOn = socket.on?.bind(socket);
  socket.__architectureOriginalOff = socket.off?.bind(socket);
  socket.__architectureWrappedHandlers = new Map();

  socket.on?.('connect', () => {
    emitSocketStatus('connected');
    logSocketEvent({ eventName: `${label}:connect`, direction: 'CONNECT', status: 'socket connected', socket });
  });

  socket.on?.('disconnect', (reason) => {
    emitSocketStatus('disconnected');
    logSocketEvent({ eventName: `${label}:disconnect`, direction: 'DISCONNECT', status: reason || 'socket disconnected', socket });
  });

  socket.on?.('connect_error', (error) => {
    emitSocketStatus('error');
    logSocketEvent({ eventName: `${label}:connect_error`, direction: 'ERROR', status: error?.message || 'connect error', socket });
  });

  socket.emit = (eventName, ...args) => {
    const startedAt = performance.now();
    const last = args[args.length - 1];
    logSocketEvent({ eventName, direction: 'SEND', status: 'event emitted', socket });

    if (typeof last === 'function') {
      args[args.length - 1] = (...ackArgs) => {
        logSocketEvent({
          eventName,
          direction: 'ACK',
          elapsed: Math.round(performance.now() - startedAt),
          status: ackArgs?.[0]?.ok === false ? 'ack failed' : 'ack received',
          socket,
        });
        return last(...ackArgs);
      };
    }

    return socket.__architectureOriginalEmit(eventName, ...args);
  };

  socket.on = (eventName, handler) => {
    if (typeof handler !== 'function') {
      return socket.__architectureOriginalOn(eventName, handler);
    }

    const wrapped = (...args) => {
      logSocketEvent({ eventName, direction: 'RECEIVE', status: 'event received', socket });
      return handler(...args);
    };
    socket.__architectureWrappedHandlers.set(handler, wrapped);
    return socket.__architectureOriginalOn(eventName, wrapped);
  };

  socket.off = (eventName, handler) => {
    const wrapped = socket.__architectureWrappedHandlers.get(handler);
    if (wrapped) {
      socket.__architectureWrappedHandlers.delete(handler);
      return socket.__architectureOriginalOff(eventName, wrapped);
    }
    return socket.__architectureOriginalOff(eventName, handler);
  };

  return socket;
}
