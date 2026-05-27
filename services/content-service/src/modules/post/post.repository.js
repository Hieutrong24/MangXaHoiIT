const mongoose = require("mongoose");
const Post = require("./post.model");
const { loadPosts, savePosts, randomObjectId } = require("../../storage/fileStore");

function applyFilters(items, query = {}, { includeAll = false } = {}) {
  let out = [...items];
  if (!includeAll && query.groupId === undefined && !query.postType) {
    out = out.filter((x) => !x.groupId && String(x.moderationStatus || "approved") === "approved");
  }
  if (query.authorId) out = out.filter((x) => String(x.authorId) === String(query.authorId));
  if (query.groupId !== undefined) {
    if (query.groupId === null) out = out.filter((x) => !x.groupId);
    else out = out.filter((x) => String(x.groupId || "") === String(query.groupId));
  }
  if (query.moderationStatus) out = out.filter((x) => String(x.moderationStatus || "approved") === String(query.moderationStatus));
  if (query.postType) out = out.filter((x) => String(x.postType || "feed") === String(query.postType));
  if (query.visibility) out = out.filter((x) => String(x.visibility || "public") === String(query.visibility));
  if (query.keyword) {
    const k = String(query.keyword).trim().toLowerCase();
    out = out.filter((x) => [x.title, x.content, ...(Array.isArray(x.tags) ? x.tags : [])].join(" ").toLowerCase().includes(k));
  }
  return out;
}

function paginate(items, { page = 1, pageSize = 20 } = {}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safePageSize = Math.max(1, Math.min(100, Number(pageSize) || 20));
  const total = items.length;
  const paged = items.slice((safePage - 1) * safePageSize, safePage * safePageSize);
  return { items: paged, total, page: safePage, pageSize: safePageSize };
}

function createMongoPostRepository() {
  return {
    driver: "mongo",
    async create(data) {
      const doc = await Post.create(data);
      return doc.toObject();
    },
    async getById(id) {
      if (!mongoose.isValidObjectId(id)) return null;
      return Post.findById(id).lean();
    },
    async list(query = {}) {
      const q = {};
      if (query.authorId) q.authorId = String(query.authorId);
      if (query.groupId !== undefined) q.groupId = query.groupId === null ? null : String(query.groupId);
      if (query.moderationStatus) q.moderationStatus = String(query.moderationStatus);
      if (query.postType) q.postType = String(query.postType);
      if (query.visibility) q.visibility = String(query.visibility);
      if (query.keyword) q.$or = [
        { title: { $regex: String(query.keyword), $options: "i" } },
        { content: { $regex: String(query.keyword), $options: "i" } },
        { tags: { $elemMatch: { $regex: String(query.keyword), $options: "i" } } },
      ];
      const safePage = Math.max(1, Number(query.page) || 1);
      const safePageSize = Math.max(1, Math.min(100, Number(query.pageSize) || 20));
      const skip = (safePage - 1) * safePageSize;
      const [items, total] = await Promise.all([
        Post.find(q).sort({ createdAt: -1 }).skip(skip).limit(safePageSize).lean(),
        Post.countDocuments(q),
      ]);
      return { items, total, page: safePage, pageSize: safePageSize };
    },
    async adminList(query = {}) {
      return this.list(query);
    },
    async remove(id) {
      if (!mongoose.isValidObjectId(id)) return null;
      return Post.findByIdAndDelete(id).lean();
    },
    async update(id, patch) {
      if (!mongoose.isValidObjectId(id)) return null;
      return Post.findByIdAndUpdate(id, { $set: { ...patch, updatedAt: new Date() } }, { new: true }).lean();
    },
    async toggleLike(id, userId) {
      if (!mongoose.isValidObjectId(id)) return null;
      const post = await Post.findById(id).lean();
      if (!post) return null;
      const uid = String(userId);
      const currentLikes = Array.isArray(post.likes) ? post.likes.map(String) : [];
      const hasLiked = currentLikes.includes(uid);
      const currentLikeCount = typeof post.likeCount === "number" ? post.likeCount : currentLikes.length;
      const updated = hasLiked
        ? await Post.findByIdAndUpdate(id, { $pull: { likes: uid }, $set: { likeCount: Math.max(0, currentLikeCount - 1) } }, { new: true }).lean()
        : await Post.findByIdAndUpdate(id, { $addToSet: { likes: uid }, $set: { likeCount: currentLikeCount + 1 } }, { new: true }).lean();
      if (!updated) return null;
      return { post: updated, liked: !hasLiked, likeCount: typeof updated.likeCount === "number" ? updated.likeCount : Array.isArray(updated.likes) ? updated.likes.length : 0 };
    },
    async incrementShareCount(id) {
      if (!mongoose.isValidObjectId(id)) return null;
      return Post.findByIdAndUpdate(id, { $inc: { shareCount: 1 } }, { new: true }).lean();
    },
    async incrementCommentCount(id, amount = 1) {
      if (!mongoose.isValidObjectId(id)) return null;
      return Post.findByIdAndUpdate(id, { $inc: { commentCount: Number(amount) || 1 } }, { new: true }).lean();
    },
    async decrementCommentCount(id, amount = 1) {
      if (!mongoose.isValidObjectId(id)) return null;
      const post = await Post.findById(id);
      if (!post) return null;
      post.commentCount = Math.max(0, Number(post.commentCount || 0) - (Number(amount) || 1));
      await post.save();
      return post.toObject();
    },
    async getAdminStats() {
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const [totalPosts, feedPosts, groupPosts, pendingPosts, rejectedPosts, recentPosts7d, aggregates] = await Promise.all([
        Post.countDocuments({}),
        Post.countDocuments({ postType: "feed" }),
        Post.countDocuments({ postType: "group" }),
        Post.countDocuments({ moderationStatus: "pending" }),
        Post.countDocuments({ moderationStatus: "rejected" }),
        Post.countDocuments({ createdAt: { $gte: since } }),
        Post.aggregate([
          {
            $group: {
              _id: null,
              totalLikes: { $sum: { $ifNull: ["$likeCount", 0] } },
              totalShares: { $sum: { $ifNull: ["$shareCount", 0] } },
              totalComments: { $sum: { $ifNull: ["$commentCount", 0] } },
            },
          },
        ]),
      ]);

      const totals = aggregates[0] || {};
      return {
        totalPosts,
        feedPosts,
        groupPosts,
        pendingPosts,
        rejectedPosts,
        recentPosts7d,
        totalLikes: Number(totals.totalLikes || 0),
        totalShares: Number(totals.totalShares || 0),
        totalComments: Number(totals.totalComments || 0),
      };
    },
  };
}

function createFilePostRepository() {
  return {
    driver: "file",
    async create(data) {
      const posts = loadPosts();
      const now = new Date().toISOString();
      const post = {
        _id: randomObjectId(),
        authorId: String(data.authorId),
        title: String(data.title || "Bài viết").trim(),
        content: String(data.content || "").trim(),
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        isPublic: data.isPublic !== false,
        media: Array.isArray(data.media) ? data.media : [],
        likes: [],
        likeCount: 0,
        shareCount: 0,
        commentCount: 0,
        postType: String(data.postType || (data.groupId ? "group" : "feed")).toLowerCase(),
        visibility: String(data.visibility || (data.groupId ? "group" : "public")).toLowerCase(),
        groupId: data.groupId ? String(data.groupId) : null,
        moderationStatus: String(data.moderationStatus || (data.groupId ? "approved" : "approved")).toLowerCase(),
        approvedAt: data.approvedAt || null,
        approvedBy: data.approvedBy ? String(data.approvedBy) : null,
        rejectionReason: String(data.rejectionReason || ""),
        spamStatus: String(data.spamStatus || "clear").toLowerCase(),
        spamScore: Number(data.spamScore || 0),
        spamReasons: Array.isArray(data.spamReasons) ? data.spamReasons.map(String) : [],
        reportCount: Number(data.reportCount || 0),
        qualityScore: Number(data.qualityScore || 0),
        qualityBreakdown: data.qualityBreakdown && typeof data.qualityBreakdown === "object" ? data.qualityBreakdown : {},
        sharedPostId: data.sharedPostId ? String(data.sharedPostId) : null,
        createdAt: now,
        updatedAt: now,
      };
      posts.unshift(post);
      savePosts(posts);
      return post;
    },
    async getById(id) {
      return loadPosts().find((x) => String(x._id) === String(id)) || null;
    },
    async list(query = {}) {
      let items = applyFilters(loadPosts(), query).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return paginate(items, query);
    },
    async adminList(query = {}) {
      let items = applyFilters(loadPosts(), query, { includeAll: true }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return paginate(items, query);
    },
    async remove(id) {
      const posts = loadPosts();
      const idx = posts.findIndex((x) => String(x._id) === String(id));
      if (idx < 0) return null;
      const [removed] = posts.splice(idx, 1);
      savePosts(posts);
      return removed;
    },
    async update(id, patch) {
      const posts = loadPosts();
      const post = posts.find((x) => String(x._id) === String(id));
      if (!post) return null;
      Object.assign(post, patch, { updatedAt: new Date().toISOString() });
      savePosts(posts);
      return post;
    },
    async toggleLike(id, userId) {
      const posts = loadPosts();
      const post = posts.find((x) => String(x._id) === String(id));
      if (!post) return null;
      const uid = String(userId);
      post.likes = Array.isArray(post.likes) ? post.likes.map(String) : [];
      const hasLiked = post.likes.includes(uid);
      post.likes = hasLiked ? post.likes.filter((x) => x !== uid) : [...new Set([...post.likes, uid])];
      post.likeCount = post.likes.length;
      post.updatedAt = new Date().toISOString();
      savePosts(posts);
      return { post, liked: !hasLiked, likeCount: post.likeCount };
    },
    async incrementShareCount(id) {
      const posts = loadPosts();
      const post = posts.find((x) => String(x._id) === String(id));
      if (!post) return null;
      post.shareCount = Number(post.shareCount || 0) + 1;
      post.updatedAt = new Date().toISOString();
      savePosts(posts);
      return post;
    },
    async incrementCommentCount(id, amount = 1) {
      const posts = loadPosts();
      const post = posts.find((x) => String(x._id) === String(id));
      if (!post) return null;
      post.commentCount = Math.max(0, Number(post.commentCount || 0) + (Number(amount) || 1));
      post.updatedAt = new Date().toISOString();
      savePosts(posts);
      return post;
    },
    async decrementCommentCount(id, amount = 1) {
      const posts = loadPosts();
      const post = posts.find((x) => String(x._id) === String(id));
      if (!post) return null;
      post.commentCount = Math.max(0, Number(post.commentCount || 0) - (Number(amount) || 1));
      post.updatedAt = new Date().toISOString();
      savePosts(posts);
      return post;
    },
    async getAdminStats() {
      const since = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const posts = loadPosts();
      return posts.reduce((acc, post) => {
        acc.totalPosts += 1;
        if (String(post.postType || "feed") === "group") acc.groupPosts += 1;
        else acc.feedPosts += 1;
        if (String(post.moderationStatus || "approved") === "pending") acc.pendingPosts += 1;
        if (String(post.moderationStatus || "approved") === "rejected") acc.rejectedPosts += 1;
        if (new Date(post.createdAt).getTime() >= since) acc.recentPosts7d += 1;
        acc.totalLikes += Number(post.likeCount || 0);
        acc.totalShares += Number(post.shareCount || 0);
        acc.totalComments += Number(post.commentCount || 0);
        return acc;
      }, {
        totalPosts: 0,
        feedPosts: 0,
        groupPosts: 0,
        pendingPosts: 0,
        rejectedPosts: 0,
        recentPosts7d: 0,
        totalLikes: 0,
        totalShares: 0,
        totalComments: 0,
      });
    },
  };
}

function createPostRepository({ driver = "mongo" } = {}) {
  return driver === "file" ? createFilePostRepository() : createMongoPostRepository();
}

module.exports = { createPostRepository };
