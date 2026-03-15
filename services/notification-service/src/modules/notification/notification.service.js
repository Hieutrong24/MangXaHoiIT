const notificationRepository = require('./notification.repository');
const preferenceService = require('../preference/preference.service');
const { validateCreateNotification } = require('./notification.validator');
const { NOTIFICATION_STATUS, DELIVERY_STATUS } = require('../../config/constants');
const channels = require('../../channels');

class NotificationService {
  async createNotification(payload) {
    validateCreateNotification(payload);

    const preferences = await preferenceService.getPreferences(payload.recipientId);
    const resolvedChannels = preferenceService.resolveChannels(
      preferences,
      payload.type,
      payload.channels
    );

    const notification = await notificationRepository.create({
      ...payload,
      channels: resolvedChannels,
      deliveries: resolvedChannels.map((channel) => ({ channel, status: DELIVERY_STATUS.PENDING })),
    });

    const deliveryResults = await Promise.all(
      resolvedChannels.map((channel) => channels.deliver(channel, notification.toObject()))
    );

    const deliveries = deliveryResults.map((result) => ({
      channel: result.channel,
      status: result.success ? DELIVERY_STATUS.SUCCESS : DELIVERY_STATUS.FAILED,
      errorMessage: result.error || null,
      deliveredAt: result.success ? new Date() : null,
    }));

    let status = NOTIFICATION_STATUS.DELIVERED;
    if (deliveries.every((item) => item.status === DELIVERY_STATUS.FAILED)) {
      status = NOTIFICATION_STATUS.FAILED;
    } else if (deliveries.some((item) => item.status === DELIVERY_STATUS.FAILED)) {
      status = NOTIFICATION_STATUS.PARTIAL;
    }

    return notificationRepository.updateDeliveries(notification._id, deliveries, status);
  }

  async listNotifications(userId, query) {
    const page = Number.parseInt(query.page, 10) || 1;
    const limit = Number.parseInt(query.limit, 10) || 20;
    const unreadOnly = query.unreadOnly === 'true';
    return notificationRepository.listByRecipient(userId, { page, limit, unreadOnly });
  }

  async getUnreadCount(userId) {
    const count = await notificationRepository.countUnread(userId);
    return { count };
  }

  async markAsRead(id, userId) {
    return notificationRepository.markAsRead(id, userId);
  }

  async markAllAsRead(userId) {
    const modified = await notificationRepository.markAllAsRead(userId);
    return { modified };
  }

  async deleteNotification(id, userId) {
    return notificationRepository.deleteById(id, userId);
  }
}

module.exports = new NotificationService();
