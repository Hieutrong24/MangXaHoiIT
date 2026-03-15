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
    actorId: { type: String, default: null },
    type: { type: String, required: true, index: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
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

module.exports = mongoose.model('Notification', notificationSchema);
