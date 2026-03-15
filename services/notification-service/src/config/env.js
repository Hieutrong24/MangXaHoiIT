const path = require('path');
require('dotenv').config({ path: process.env.ENV_FILE || path.resolve(process.cwd(), '.env') });

function toInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: toInt(process.env.PORT, 5010),
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/notification_service',
  rabbitUrl: process.env.RABBIT_URL || 'amqp://127.0.0.1:5672',
  rabbitExchange: process.env.RABBIT_EXCHANGE || 'events',
  serviceName: process.env.SERVICE_NAME || 'notification-service',
  smtpHost: process.env.SMTP_HOST || 'localhost',
  smtpPort: toInt(process.env.SMTP_PORT, 1025),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  mailFrom: process.env.MAIL_FROM || 'noreply@tdmu.local',
  wsEnabled: (process.env.WS_ENABLED || 'true') === 'true',
  pushEnabled: (process.env.PUSH_ENABLED || 'false') === 'true',
  userServiceUrl: process.env.USER_SERVICE_URL || 'http://localhost:5002',
  logLevel: process.env.LOG_LEVEL || 'info',
};
