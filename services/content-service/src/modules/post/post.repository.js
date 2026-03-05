const Post = require("./post.model");

function createPostRepository() {
  return {
    async create(data) {
      const doc = await Post.create(data);
      return doc;
    },

    async getById(id) {
      return Post.findById(id).lean();
    },

    async list({ page = 1, pageSize = 20, authorId } = {}) {
      const q = {};
      if (authorId) q.authorId = String(authorId);

      const skip = (page - 1) * pageSize;
      const [items, total] = await Promise.all([
        Post.find(q).sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
        Post.countDocuments(q),
      ]);

      return { items, total, page, pageSize };
    },

    
    async getRecentPosts(limit = 5) {
      return Post.find({})
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
    },

    async remove(id) {
      return Post.findByIdAndDelete(id);
    },
  };
}

module.exports = { createPostRepository };