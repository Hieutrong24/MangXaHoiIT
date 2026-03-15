const express = require('express');
const cors = require('cors');
const notificationRoutes = require('./modules/notification/notification.routes');
const preferenceRoutes = require('./modules/preference/preference.routes');
const requestIdMiddleware = require('./common/middlewares/requestId.middleware');
const errorMiddleware = require('./common/middlewares/error.middleware');

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(requestIdMiddleware);

  app.get('/health', (req, res) => {
    res.json({ service: 'notification-service', status: 'ok' });
  });

  app.use('/api/notifications', notificationRoutes);
  app.use('/api/preferences', preferenceRoutes);

  app.use(errorMiddleware);

  return app;
}

module.exports = createApp;
