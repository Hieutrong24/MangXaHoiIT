const mongoose = require("mongoose");
const Post = require("./post.model");

function createPostRepository() {
  return {
    async create(data) {
      const doc = await Post.create(data);
      return doc.toObject();
    },

    async getById(id) {
      if (!mongoose.isValidObjectId(id)) return null;
      return Post.findById(id).lean();
    },

    async list({ page = 1, pageSize = 20, authorId } = {}) {
      const q = {};

      if (authorId) {
        q.authorId = String(authorId);
      }

      const safePage = Math.max(1, Number(page) || 1);
      const safePageSize = Math.max(1, Math.min(100, Number(pageSize) || 20));
      const skip = (safePage - 1) * safePageSize;

      const [items, total] = await Promise.all([
        Post.find(q)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(safePageSize)
          .lean(),
        Post.countDocuments(q),
      ]);

      return {
        items,
        total,
        page: safePage,
        pageSize: safePageSize,
      };
    },

    async getRecentPosts(limit = 5) {
      const safeLimit = Math.max(1, Math.min(50, Number(limit) || 5));

      return Post.find({})
        .sort({ createdAt: -1 })
        .limit(safeLimit)
        .lean();
    },

    async remove(id) {
      if (!mongoose.isValidObjectId(id)) return null;
      return Post.findByIdAndDelete(id).lean();
    },

    async toggleLike(id, userId) {
      if (!mongoose.isValidObjectId(id)) return null;

      const post = await Post.findById(id);
      if (!post) return null;

      const uid = String(userId);
      const hasLiked = post.likes.includes(uid);

      if (hasLiked) {
        post.likes = post.likes.filter((x) => x !== uid);
      } else {
        post.likes.push(uid);
      }

      post.likeCount = post.likes.length;
      await post.save();

      return {
        post: post.toObject(),
        liked: !hasLiked,
        likeCount: post.likeCount,
      };
    },

    async incrementShareCount(id) {
      if (!mongoose.isValidObjectId(id)) return null;

      return Post.findByIdAndUpdate(
        id,
        { $inc: { shareCount: 1 } },
        { new: true }
      ).lean();
    },

    async incrementCommentCount(id, amount = 1) {
      if (!mongoose.isValidObjectId(id)) return null;

      return Post.findByIdAndUpdate(
        id,
        { $inc: { commentCount: Number(amount) || 1 } },
        { new: true }
      ).lean();
    },

    async decrementCommentCount(id, amount = 1) {
      if (!mongoose.isValidObjectId(id)) return null;

      const post = await Post.findById(id);
      if (!post) return null;

      const nextCount = Math.max(0, Number(post.commentCount || 0) - (Number(amount) || 1));
      post.commentCount = nextCount;
      await post.save();

      return post.toObject();
    },
  };
}

module.exports = { createPostRepository };