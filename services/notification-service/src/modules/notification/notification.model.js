const mongoose = require('mongoose');
const { CHANNELS, NOTIFICATION_STATUS, DELIVERY_STATUS } = require('../../config/constants');

const deliverySchema = new mongoose.Schema(
  {
    channel: {
      type: String,
      enum: Object.values(CHANNELS),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(DELIVERY_STATUS),
      required: true,
      default: DELIVERY_STATUS.PENDING,
    },
    errorMessage: { type: String, default: null },
    deliveredAt: { type: Date, default: null },
  },
  { _id: false }
);

const notificationSchema = new mongoose.Schema(
  {
    recipientId: { type: String, required: true, index: true },
    actorId: { type: String, default: null, index: true },
    actorName: { type: String, default: null },
    actorEmail: { type: String, default: null },
    actorAvatarUrl: { type: String, default: null },
    type: { type: String, required: true, index: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    groupName: { type: String, default: null },
    companyName: { type: String, default: null },
    jobTitle: { type: String, default: null },
    actionText: { type: String, default: null },
    occurredAt: { type: Date, default: Date.now, index: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    dedupKey: { type: String, default: null, index: true },
    dedupCount: { type: Number, default: 1, min: 1 },
    priority: { type: String, enum: ['low', 'normal', 'high'], default: 'normal', index: true },
    priorityScore: { type: Number, default: 50, min: 0, max: 100, index: true },
    channels: [{ type: String, enum: Object.values(CHANNELS), required: true }],
    deliveries: { type: [deliverySchema], default: [] },
    status: {
      type: String,
      enum: Object.values(NOTIFICATION_STATUS),
      default: NOTIFICATION_STATUS.PENDING,
    },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

notificationSchema.index({ recipientId: 1, dedupKey: 1, isRead: 1, occurredAt: -1 });
notificationSchema.index({ recipientId: 1, isRead: 1, priorityScore: -1, occurredAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
