const mongoose = require('mongoose');

const GroupMemberSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member',
      required: true,
    },
    joinedAt: { type: Date, default: Date.now },
    addedBy: { type: String, default: null },
  },
  { _id: false }
);

const GroupChatSchema = new mongoose.Schema(
  {
    chatId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: '', maxlength: 500 },
    avatarUrl: { type: String, default: '' },
    createdBy: { type: String, required: true },
    members: { type: [GroupMemberSchema], default: [] },
    memberCount: { type: Number, default: 0 },
    lastMessagePreview: { type: String, default: '' },
    lastMessageAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

GroupChatSchema.index({ 'members.userId': 1, updatedAt: -1 });
GroupChatSchema.index({ lastMessageAt: -1, updatedAt: -1 });

const GroupChatModel = mongoose.model('GroupChat', GroupChatSchema);

module.exports = { GroupChatModel };
