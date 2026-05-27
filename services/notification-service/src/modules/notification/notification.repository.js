const Notification = require('./notification.model');

class NotificationRepository {
  async create(payload) {
    return Notification.create(payload);
  }

  async findRecentUnreadDuplicate({ recipientId, dedupKey, minutes = 30 }) {
    if (!recipientId || !dedupKey) return null;
    const since = new Date(Date.now() - Math.max(1, Number(minutes) || 30) * 60 * 1000);
    return Notification.findOne({
      recipientId: String(recipientId),
      dedupKey: String(dedupKey),
      isRead: false,
      occurredAt: { $gte: since },
    }).sort({ occurredAt: -1 });
  }

  async mergeDuplicate(id, payload) {
    return Notification.findByIdAndUpdate(
      id,
      {
        $set: {
          title: payload.title,
          body: payload.body,
          actorId: payload.actorId,
          actorName: payload.actorName,
          actorEmail: payload.actorEmail,
          actorAvatarUrl: payload.actorAvatarUrl,
          occurredAt: payload.occurredAt || new Date(),
          data: payload.data || {},
          priority: payload.priority,
          priorityScore: payload.priorityScore,
        },
        $inc: { dedupCount: 1 },
      },
      { new: true }
    ).lean();
  }

  async listByRecipient(recipientId, { page = 1, limit = 20, unreadOnly = false } = {}) {
    const query = { recipientId };
    if (unreadOnly) query.isRead = false;

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Notification.find(query)
        .sort({ isRead: 1, priorityScore: -1, occurredAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(query),
    ]);

    return { items, total, page, limit };
  }

  async adminList(query = {}) {
    const page = Number.parseInt(query.page, 10) || 1;
    const limit = Number.parseInt(query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const mongoQuery = {};
    if (query.recipientId) mongoQuery.recipientId = String(query.recipientId);
    if (query.type) mongoQuery.type = String(query.type);
    if (query.status) mongoQuery.status = String(query.status);
    if (query.keyword) {
      const regex = new RegExp(String(query.keyword), 'i');
      mongoQuery.$or = [{ title: regex }, { body: regex }, { actorName: regex }, { companyName: regex }];
    }

    const [items, total] = await Promise.all([
      Notification.find(mongoQuery).sort({ occurredAt: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      Notification.countDocuments(mongoQuery),
    ]);

    return { items, total, page, limit };
  }

  async countUnread(recipientId) {
    return Notification.countDocuments({ recipientId, isRead: false });
  }

  async findByIdAndRecipient(id, recipientId) {
    return Notification.findOne({ _id: id, recipientId });
  }

  async markAsRead(id, recipientId) {
    return Notification.findOneAndUpdate(
      { _id: id, recipientId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } },
      { new: true }
    );
  }

  async markAllAsRead(recipientId) {
    const result = await Notification.updateMany(
      { recipientId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );
    return result.modifiedCount || 0;
  }

  async deleteById(id, recipientId) {
    return Notification.findOneAndDelete({ _id: id, recipientId });
  }

  async updateDeliveries(id, deliveries, status) {
    return Notification.findByIdAndUpdate(
      id,
      { $set: { deliveries, status } },
      { new: true }
    ).lean();
  }

  async getAdminDashboard() {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [totals, topTypes, uniqueRecipients, recentNotifications7d] = await Promise.all([
      Notification.aggregate([
        {
          $group: {
            _id: null,
            totalNotifications: { $sum: 1 },
            unreadNotifications: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } },
            readNotifications: { $sum: { $cond: [{ $eq: ['$isRead', true] }, 1, 0] } },
            deliveredNotifications: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
            partialNotifications: { $sum: { $cond: [{ $eq: ['$status', 'partial'] }, 1, 0] } },
            failedNotifications: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
          },
        },
      ]),
      Notification.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      Notification.distinct('recipientId'),
      Notification.countDocuments({ createdAt: { $gte: since } }),
    ]);

    return {
      totalNotifications: Number(totals[0]?.totalNotifications || 0),
      unreadNotifications: Number(totals[0]?.unreadNotifications || 0),
      readNotifications: Number(totals[0]?.readNotifications || 0),
      deliveredNotifications: Number(totals[0]?.deliveredNotifications || 0),
      partialNotifications: Number(totals[0]?.partialNotifications || 0),
      failedNotifications: Number(totals[0]?.failedNotifications || 0),
      uniqueRecipients: uniqueRecipients.length,
      recentNotifications7d,
      topTypes: topTypes.map((item) => ({ type: item._id || 'unknown', count: item.count })),
    };
  }
}

module.exports = new NotificationRepository();
