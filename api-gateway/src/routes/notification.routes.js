const express = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { notificationController } = require('../controllers/notification.controller');

const router = express.Router();
router.use(authMiddleware());

router.get('/', notificationController.list);
router.get('/unread-count', notificationController.unreadCount);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', notificationController.markAsRead);
router.delete('/:id', notificationController.remove);
router.get('/preferences/me', notificationController.getPreferences);
router.put('/preferences/me', notificationController.updatePreferences);

module.exports = { notificationRoutes: router };
