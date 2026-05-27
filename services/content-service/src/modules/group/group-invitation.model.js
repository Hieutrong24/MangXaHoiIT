const mongoose = require("mongoose");

const GroupInvitationSchema = new mongoose.Schema(
  {
    groupId: { type: String, required: true, trim: true, index: true },
    recipientId: { type: String, required: true, trim: true, index: true },
    invitedBy: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["member", "moderator", "admin"],
      default: "member",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled"],
      default: "pending",
      index: true,
    },
    note: { type: String, default: "", trim: true },
    respondedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

GroupInvitationSchema.index({ groupId: 1, recipientId: 1, status: 1 });
GroupInvitationSchema.index({ recipientId: 1, createdAt: -1 });

module.exports = mongoose.model("GroupInvitation", GroupInvitationSchema);
