const mongoose = require("mongoose");

const GroupMemberSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["owner", "admin", "moderator", "member"],
      default: "member",
    },
    status: {
      type: String,
      enum: ["active", "banned"],
      default: "active",
    },
    joinedAt: { type: Date, default: Date.now },
    bannedAt: { type: Date, default: null },
  },
  { _id: false }
);

const GroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true, index: true },
    description: { type: String, default: "", trim: true },
    avatarUrl: { type: String, default: "", trim: true },
    coverUrl: { type: String, default: "", trim: true },
    category: { type: String, default: "general", trim: true, lowercase: true },
    privacy: { type: String, enum: ["public", "private"], default: "public", index: true },
    joinCode: { type: String, required: true, trim: true, uppercase: true, unique: true, index: true },
    ownerId: { type: String, required: true, trim: true, index: true },
    location: { type: String, default: "", trim: true },
    website: { type: String, default: "", trim: true },
    contactEmail: { type: String, default: "", trim: true },
    rules: { type: [String], default: [] },
    topics: { type: [String], default: [] },
    members: { type: [GroupMemberSchema], default: [] },
    memberCount: { type: Number, default: 0 },
    postCount: { type: Number, default: 0 },
    pendingPostCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

GroupSchema.index({ createdAt: -1 });
GroupSchema.index({ category: 1, privacy: 1, createdAt: -1 });

module.exports = mongoose.model("Group", GroupSchema);
