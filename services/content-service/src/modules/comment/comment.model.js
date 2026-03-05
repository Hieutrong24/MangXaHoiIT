const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true, ref: "Post" },
    authorId: { type: String, required: true, index: true },
    content: { type: String, required: true, maxlength: 5000 }
  },
  { timestamps: true }
);

CommentSchema.index({ postId: 1, createdAt: -1 });

const Comment = mongoose.model("Comment", CommentSchema);
module.exports = { Comment };
