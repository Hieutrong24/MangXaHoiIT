const Notification = require('./notification.model');

class NotificationRepository {
  async create(payload) {
    return Notification.create(payload);
  }

  async listByRecipient(recipientId, { page = 1, limit = 20, unreadOnly = false } = {}) {
    const query = { recipientId };
    if (unreadOnly) query.isRead = false;

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Notification.countDocuments(query),
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
    );
  }
}

module.exports = new NotificationRepository();
