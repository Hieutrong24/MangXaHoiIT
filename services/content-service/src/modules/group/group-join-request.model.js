const mongoose = require("mongoose");

const GroupJoinRequestSchema = new mongoose.Schema(
  {
    groupId: { type: String, required: true, trim: true, index: true },
    userId: { type: String, required: true, trim: true, index: true },
    note: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
      index: true,
    },
    reviewedBy: { type: String, default: null, trim: true },
    reviewedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

GroupJoinRequestSchema.index({ groupId: 1, userId: 1, status: 1 });
GroupJoinRequestSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("GroupJoinRequest", GroupJoinRequestSchema);
