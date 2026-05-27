const asyncHandler = require('../../common/utils/asyncHandler');
const AppError = require('../../common/errors/AppError');
const notificationService = require('./notification.service');

function getUserId(req) {
  return req.headers['x-user-id'] || req.query.userId || req.body.userId;
}

exports.create = asyncHandler(async (req, res) => {
  const created = await notificationService.createNotification(req.body);
  res.status(201).json(created);
});

exports.list = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const result = await notificationService.listNotifications(userId, req.query);
  res.json(result);
});

exports.unreadCount = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const result = await notificationService.getUnreadCount(userId);
  res.json(result);
});

exports.markAsRead = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const updated = await notificationService.markAsRead(req.params.id, userId);
  if (!updated) throw new AppError('Không tìm thấy notification', 404);
  res.json(updated);
});

exports.markAllAsRead = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const result = await notificationService.markAllAsRead(userId);
  res.json(result);
});

exports.remove = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const deleted = await notificationService.deleteNotification(req.params.id, userId);
  if (!deleted) throw new AppError('Không tìm thấy notification', 404);
  res.status(204).send();
});
