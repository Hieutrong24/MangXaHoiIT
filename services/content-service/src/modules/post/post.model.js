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
    authorId: {
      type: String,
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000,
    },

    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    isPublic: {
      type: Boolean,
      default: true,
      index: true,
    },

    media: {
      type: [MediaSchema],
      default: [],
    },

    likes: {
      type: [String],
      default: [],
    },

    likeCount: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },

    shareCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    commentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

PostSchema.index({ createdAt: -1 });
PostSchema.index({ authorId: 1, createdAt: -1 });
PostSchema.index({ likeCount: -1, createdAt: -1 });

module.exports = mongoose.model("Post", PostSchema);