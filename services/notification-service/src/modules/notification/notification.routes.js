const express = require('express');
const controller = require('./notification.controller');

const router = express.Router();

router.get('/', controller.list);
router.post('/', controller.create);
router.get('/unread-count', controller.unreadCount);
router.patch('/read-all', controller.markAllAsRead);
router.patch('/:id/read', controller.markAsRead);
router.delete('/:id', controller.remove);

module.exports = router;
