const mongoose = require("mongoose");
const Comment = require("./comment.model");

function createCommentRepository() {
  return {
    async create(data) {
      const doc = await Comment.create(data);
      return doc.toObject();
    },

    async getById(id) {
      if (!mongoose.isValidObjectId(id)) return null;
      return Comment.findById(id).lean();
    },

    async listByPost({ postId, page = 1, pageSize = 20 }) {
      const safePage = Math.max(1, Number(page) || 1);
      const safePageSize = Math.max(1, Math.min(100, Number(pageSize) || 20));
      const skip = (safePage - 1) * safePageSize;

      const [items, total] = await Promise.all([
        Comment.find({ postId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(safePageSize)
          .lean(),
        Comment.countDocuments({ postId }),
      ]);

      return {
        items,
        total,
        page: safePage,
        pageSize: safePageSize,
      };
    },

    async remove(id) {
      if (!mongoose.isValidObjectId(id)) return null;
      return Comment.findByIdAndDelete(id).lean();
    },
  };
}

module.exports = { createCommentRepository };