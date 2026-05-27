const mongoose = require('mongoose');

const preferenceSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    emailEnabled: { type: Boolean, default: true },
    pushEnabled: { type: Boolean, default: false },
    realtimeEnabled: { type: Boolean, default: true },
    inAppEnabled: { type: Boolean, default: true },
    mutedTypes: { type: [String], default: [] },
    typeSettings: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model('NotificationPreference', preferenceSchema);
