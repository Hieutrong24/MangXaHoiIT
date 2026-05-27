const { notificationClient } = require('../clients/notification.client');

function makeCtx(req) {
  const authHeader = req.headers?.authorization || req.authHeader || null;
  const userId = req.user?.id || req.user?.userId || null;
  return {
    correlationId: req.correlationId,
    authHeader,
    xUserId: userId,
    user: req.user,
  };
}

const notificationController = {
  async list(req, res, next) {
    try {
      const data = await notificationClient.list(req.query, makeCtx(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },
  async unreadCount(req, res, next) {
    try {
      const data = await notificationClient.unreadCount(makeCtx(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },
  async markAsRead(req, res, next) {
    try {
      const data = await notificationClient.markAsRead(req.params.id, makeCtx(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },
  async markAllAsRead(req, res, next) {
    try {
      const data = await notificationClient.markAllAsRead(makeCtx(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },
  async remove(req, res, next) {
    try {
      await notificationClient.remove(req.params.id, makeCtx(req));
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  },
  async getPreferences(req, res, next) {
    try {
      const data = await notificationClient.getPreferences(makeCtx(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },
  async updatePreferences(req, res, next) {
    try {
      const data = await notificationClient.updatePreferences(req.body, makeCtx(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },
};

module.exports = { notificationController };
