const express = require('express');
const controller = require('./notification.admin.controller');

const router = express.Router();

router.get('/', controller.list);
router.post('/broadcast', controller.broadcast);
router.get('/dashboard', controller.dashboard);

module.exports = router;
