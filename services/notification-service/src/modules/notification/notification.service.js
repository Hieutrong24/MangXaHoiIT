const notificationRepository = require('./notification.repository');
const preferenceService = require('../preference/preference.service');
const { validateCreateNotification } = require('./notification.validator');
const { NOTIFICATION_STATUS, DELIVERY_STATUS } = require('../../config/constants');
const { normalizeNotificationPayload } = require('./notification.formatter');
const channels = require('../../channels');
const { buildDedupKey, priorityFor } = require('./notification-ranking');

class NotificationService {
  async createNotification(payload) {
    const normalizedPayload = await normalizeNotificationPayload(payload);
    validateCreateNotification(normalizedPayload);
    const dedupKey = normalizedPayload.dedupKey || buildDedupKey(normalizedPayload);
    const priority = priorityFor(normalizedPayload);

    const preferences = await preferenceService.getPreferences(normalizedPayload.recipientId);
    const resolvedChannels = preferenceService.resolveChannels(
      preferences,
      normalizedPayload.type,
      normalizedPayload.channels
    );

    const duplicate = await notificationRepository.findRecentUnreadDuplicate({
      recipientId: normalizedPayload.recipientId,
      dedupKey,
      minutes: normalizedPayload.dedupWindowMinutes || 30,
    });

    if (duplicate) {
      return notificationRepository.mergeDuplicate(duplicate._id, {
        ...normalizedPayload,
        dedupKey,
        channels: resolvedChannels,
        priority: priority.priority,
        priorityScore: priority.score,
        data: {
          ...(normalizedPayload.data || {}),
          deduped: true,
          dedupKey,
        },
      });
    }

    const notification = await notificationRepository.create({
      ...normalizedPayload,
      dedupKey,
      priority: priority.priority,
      priorityScore: priority.score,
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

  async adminListNotifications(query = {}) {
    return notificationRepository.adminList(query);
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

  async broadcastNotification(payload = {}) {
    const recipientIds = [...new Set((Array.isArray(payload.recipientIds) ? payload.recipientIds : []).map((item) => String(item || '').trim()).filter(Boolean))];
    if (!recipientIds.length) throw new Error('recipientIds required');

    const items = await Promise.all(
      recipientIds.map((recipientId) =>
        this.createNotification({
          ...payload,
          recipientId,
        })
      )
    );

    return {
      totalRecipients: recipientIds.length,
      delivered: items.filter((item) => item?.status === NOTIFICATION_STATUS.DELIVERED).length,
      partial: items.filter((item) => item?.status === NOTIFICATION_STATUS.PARTIAL).length,
      failed: items.filter((item) => item?.status === NOTIFICATION_STATUS.FAILED).length,
      items,
    };
  }

  async getAdminDashboard() {
    return notificationRepository.getAdminDashboard();
  }
}

module.exports = new NotificationService();
