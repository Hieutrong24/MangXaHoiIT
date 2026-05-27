const asyncHandler = require('../../common/utils/asyncHandler');
const notificationService = require('./notification.service');

exports.list = asyncHandler(async (req, res) => {
  const result = await notificationService.adminListNotifications(req.query);
  res.json(result);
});

exports.broadcast = asyncHandler(async (req, res) => {
  const result = await notificationService.broadcastNotification(req.body || {});
  res.status(201).json(result);
});

exports.dashboard = asyncHandler(async (_req, res) => {
  const result = await notificationService.getAdminDashboard();
  res.json(result);
});
