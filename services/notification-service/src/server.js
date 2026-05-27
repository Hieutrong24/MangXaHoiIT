const http = require('http');
const { Server } = require('socket.io');
const createApp = require('./app');
const env = require('./config/env');
const { connectDatabase } = require('./config/database');
const broker = require('./integrations/broker');
const websocket = require('./integrations/websocket');
const eventRegistry = require('./events');
const notificationService = require('./modules/notification/notification.service');
const startRetryFailedDeliveriesJob = require('./jobs/retry-failed-deliveries.job');
const startCleanupOldNotificationsJob = require('./jobs/cleanup-old-notifications.job');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connectBrokerWithRetry(maxRetries = 20, delayMs = 5000) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[notification-service] connect broker attempt ${attempt}/${maxRetries}`);
      await broker.connectBroker();
      console.log('[notification-service] broker connected');
      return;
    } catch (error) {
      lastError = error;
      console.error(
        `[notification-service] broker connect failed attempt ${attempt}/${maxRetries}: ${error.message}`
      );

      if (attempt < maxRetries) {
        await sleep(delayMs);
      }
    }
  }

  throw lastError;
}

async function bootstrap() {
  await connectDatabase();

  const app = createApp();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket) => {
    const userId = socket.handshake.auth?.userId || socket.handshake.query?.userId;
    if (userId) {
      socket.join(`user:${userId}`);
    }
  });

  websocket.setServer(io);

  eventRegistry.init({ notificationService });

  await connectBrokerWithRetry();
  await broker.consumeEvents();

  startRetryFailedDeliveriesJob();
  startCleanupOldNotificationsJob();

  server.listen(env.port, '0.0.0.0', () => {
    console.log(`notification-service is running on port ${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start notification-service:', error);
  process.exit(1);
});