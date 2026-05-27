const mongoose = require("mongoose");
const Comment = require("./comment.model");
const { loadComments, saveComments, randomObjectId } = require("../../storage/fileStore");

function createMongoCommentRepository() {
  return {
    driver: "mongo",
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
        Comment.find({ postId }).sort({ createdAt: -1 }).skip(skip).limit(safePageSize).lean(),
        Comment.countDocuments({ postId }),
      ]);

      return { items, total, page: safePage, pageSize: safePageSize };
    },
    async listRecentByAuthor({ authorId, minutes = 60, limit = 50 }) {
      const since = new Date(Date.now() - Math.max(1, Number(minutes) || 60) * 60 * 1000);
      const safeLimit = Math.max(1, Math.min(200, Number(limit) || 50));
      return Comment.find({ authorId: String(authorId), createdAt: { $gte: since } })
        .sort({ createdAt: -1 })
        .limit(safeLimit)
        .lean();
    },
    async adminList(query = {}) {
      const safePage = Math.max(1, Number(query.page) || 1);
      const safePageSize = Math.max(1, Math.min(100, Number(query.pageSize) || 20));
      const skip = (safePage - 1) * safePageSize;
      const mongoQuery = {};
      if (query.postId) mongoQuery.postId = String(query.postId);
      if (query.authorId) mongoQuery.authorId = String(query.authorId);
      if (query.keyword) mongoQuery.content = { $regex: String(query.keyword), $options: "i" };

      const [items, total] = await Promise.all([
        Comment.find(mongoQuery).sort({ createdAt: -1 }).skip(skip).limit(safePageSize).lean(),
        Comment.countDocuments(mongoQuery),
      ]);

      return { items, total, page: safePage, pageSize: safePageSize };
    },

    async remove(id) {
      if (!mongoose.isValidObjectId(id)) return null;
      return Comment.findByIdAndDelete(id).lean();
    },
    async getAdminStats() {
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const [totalComments, recentComments7d] = await Promise.all([
        Comment.countDocuments({}),
        Comment.countDocuments({ createdAt: { $gte: since } }),
      ]);
      return { totalComments, recentComments7d };
    },
  };
}

function createFileCommentRepository() {
  return {
    driver: "file",
    async create(data) {
      const comments = loadComments();
      const now = new Date().toISOString();
      const comment = {
        _id: randomObjectId(),
        postId: String(data.postId),
        authorId: String(data.authorId),
        content: String(data.content || "").trim(),
        createdAt: now,
        updatedAt: now,
      };
      comments.unshift(comment);
      saveComments(comments);
      return comment;
    },

    async getById(id) {
      return loadComments().find((x) => String(x._id) === String(id)) || null;
    },

    async listByPost({ postId, page = 1, pageSize = 20 }) {
      const safePage = Math.max(1, Number(page) || 1);
      const safePageSize = Math.max(1, Math.min(100, Number(pageSize) || 20));
      let items = loadComments().filter((x) => String(x.postId) === String(postId));
      items = items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const total = items.length;
      items = items.slice((safePage - 1) * safePageSize, safePage * safePageSize);
      return { items, total, page: safePage, pageSize: safePageSize };
    },
    async listRecentByAuthor({ authorId, minutes = 60, limit = 50 }) {
      const since = Date.now() - Math.max(1, Number(minutes) || 60) * 60 * 1000;
      return loadComments()
        .filter((x) => String(x.authorId) === String(authorId))
        .filter((x) => new Date(x.createdAt || 0).getTime() >= since)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, Math.max(1, Math.min(200, Number(limit) || 50)));
    },
    async adminList(query = {}) {
      const safePage = Math.max(1, Number(query.page) || 1);
      const safePageSize = Math.max(1, Math.min(100, Number(query.pageSize) || 20));
      let items = loadComments();
      if (query.postId) items = items.filter((x) => String(x.postId) === String(query.postId));
      if (query.authorId) items = items.filter((x) => String(x.authorId) === String(query.authorId));
      if (query.keyword) {
        const keyword = String(query.keyword).trim().toLowerCase();
        items = items.filter((x) => String(x.content || "").toLowerCase().includes(keyword));
      }
      items = items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const total = items.length;
      items = items.slice((safePage - 1) * safePageSize, safePage * safePageSize);
      return { items, total, page: safePage, pageSize: safePageSize };
    },

    async remove(id) {
      const comments = loadComments();
      const idx = comments.findIndex((x) => String(x._id) === String(id));
      if (idx < 0) return null;
      const [removed] = comments.splice(idx, 1);
      saveComments(comments);
      return removed;
    },
    async getAdminStats() {
      const since = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const comments = loadComments();
      return comments.reduce((acc, comment) => {
        acc.totalComments += 1;
        if (new Date(comment.createdAt).getTime() >= since) acc.recentComments7d += 1;
        return acc;
      }, { totalComments: 0, recentComments7d: 0 });
    },
  };
}

function createCommentRepository({ driver = "mongo" } = {}) {
  return driver === "file" ? createFileCommentRepository() : createMongoCommentRepository();
}

module.exports = { createCommentRepository };
