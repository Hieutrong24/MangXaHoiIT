const  Comment  = require("./comment.model");

function createCommentRepository() {
  return {
    async create(data) {
      return Comment.create(data);
    },

    async listByPost({ postId, page = 1, pageSize = 20 }) {
      const skip = (page - 1) * pageSize;

      const [items, total] = await Promise.all([
        Comment.find({ postId }).sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
        Comment.countDocuments({ postId })
      ]);

      return { items, total, page, pageSize };
    },

    async remove(id) {
      return Comment.findByIdAndDelete(id);
    }
  };
}

module.exports = { createCommentRepository };
