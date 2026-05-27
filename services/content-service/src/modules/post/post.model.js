const mongoose = require("mongoose");

const MediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    secureUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    resourceType: {
      type: String,
      enum: ["image", "video", "raw", "auto"],
      required: true,
    },
    format: { type: String, default: "" },
    bytes: { type: Number, default: 0 },
    originalName: { type: String, default: "" },
    mimeType: { type: String, default: "" },
    width: { type: Number, default: null },
    height: { type: Number, default: null },
    duration: { type: Number, default: null },
  },
  { _id: false }
);

const PostSchema = new mongoose.Schema(
  {
    authorId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 300 },
    content: { type: String, required: true, trim: true, maxlength: 10000 },
    tags: [{ type: String, trim: true, lowercase: true }],
    isPublic: { type: Boolean, default: true, index: true },
    media: { type: [MediaSchema], default: [] },
    likes: { type: [String], default: [] },
    likeCount: { type: Number, default: 0, min: 0, index: true },
    shareCount: { type: Number, default: 0, min: 0 },
    commentCount: { type: Number, default: 0, min: 0 },
    postType: { type: String, default: "feed", enum: ["feed", "group"] },
    visibility: { type: String, default: "public", enum: ["public", "group"] },
    groupId: { type: String, default: null, index: true },
    moderationStatus: { type: String, default: "approved", enum: ["pending", "approved", "rejected"], index: true },
    approvedAt: { type: Date, default: null },
    approvedBy: { type: String, default: null },
    rejectionReason: { type: String, default: "" },
    spamStatus: { type: String, default: "clear", enum: ["clear", "review", "blocked"], index: true },
    spamScore: { type: Number, default: 0, min: 0 },
    spamReasons: [{ type: String, trim: true }],
    reportCount: { type: Number, default: 0, min: 0, index: true },
    qualityScore: { type: Number, default: 0, min: 0, max: 100, index: true },
    qualityBreakdown: { type: mongoose.Schema.Types.Mixed, default: {} },
    sharedPostId: { type: String, default: null },
  },
  { timestamps: true, versionKey: false }
);

PostSchema.index({ createdAt: -1 });
PostSchema.index({ authorId: 1, createdAt: -1 });
PostSchema.index({ likeCount: -1, createdAt: -1 });
PostSchema.index({ groupId: 1, moderationStatus: 1, createdAt: -1 });

module.exports = mongoose.model("Post", PostSchema);
