const mongoose = require("mongoose");
const { rankFeed } = require("./feed-ranking");
const {
  recommendPosts: scoreRecommendedPosts,
  searchPosts: scoreSearchPosts,
  trendingPosts: scoreTrendingPosts,
} = require("./post-discovery");
const { assessPostSpam } = require("./spam-detector");
const { calculateContentQuality, attachContentQuality } = require("./content-quality");

function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];

  return [
    ...new Set(
      tags
        .map((x) => String(x || "").trim().toLowerCase())
        .filter(Boolean)
    ),
  ];
}

function normalizeMedia(media) {
  if (!Array.isArray(media)) return [];

  return media
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      const resourceType = String(item.resourceType || "raw").toLowerCase();

      return {
        url: String(item.url || "").trim(),
        secureUrl: String(item.secureUrl || item.url || "").trim(),
        publicId: String(item.publicId || "").trim(),
        resourceType: ["image", "video", "raw", "auto"].includes(resourceType)
          ? resourceType
          : "raw",
        format: String(item.format || "").trim(),
        bytes: Number(item.bytes || 0),
        originalName: String(item.originalName || "").trim(),
        mimeType: String(item.mimeType || "").trim(),
        width: item.width ?? null,
        height: item.height ?? null,
        duration: item.duration ?? null,
      };
    })
    .filter(
      (item) =>
        item &&
        item.url &&
        item.secureUrl &&
        item.publicId &&
        item.resourceType
    );
}

function createPostService({
  postRepository,
  postCreatedPublisher,
  commentService,
}) {
  return {
    async createPost(
      { authorId, title, content, tags, isPublic, media },
      traceId
    ) {
      if (!authorId) throw new Error("authorId required");
      if (!title || !title.trim()) throw new Error("title required");
      if (!content || !content.trim()) throw new Error("content required");

      const normalizedMedia = normalizeMedia(media);
      const recentByAuthor = await postRepository.list({
        authorId: String(authorId),
        page: 1,
        pageSize: 50,
      });
      const spam = assessPostSpam({
        title,
        content,
        recentPosts: recentByAuthor.items || [],
      });
      if (spam.status === "blocked") {
        throw new Error(`post blocked by spam detector: ${spam.reasons.join(", ") || "spam"}`);
      }

      const quality = calculateContentQuality({
        title,
        content,
        media: normalizedMedia,
        spamScore: spam.score,
        reportCount: 0,
      });

      const post = await postRepository.create({
        authorId: String(authorId),
        title: title.trim(),
        content: content.trim(),
        tags: normalizeTags(tags),
        isPublic: isPublic !== false,
        media: normalizedMedia,
        moderationStatus: spam.status === "review" ? "pending" : "approved",
        spamStatus: spam.status,
        spamScore: spam.score,
        spamReasons: spam.reasons,
        qualityScore: quality.score,
        qualityBreakdown: quality,
      });

      if (postCreatedPublisher?.publish) {
        try {
          await postCreatedPublisher.publish({ post, traceId });
        } catch (error) {
          console.warn("[content-service] post.created publish skipped:", error?.message || error);
        }
      }

      return attachContentQuality(post);
    },

    async getPost(id) {
      if (!mongoose.isValidObjectId(id)) return null;
      const post = await postRepository.getById(id);
      return post ? attachContentQuality(post) : null;
    },

    async listPosts(query) {
      const data = await postRepository.list(query);
      return { ...data, items: (data.items || []).map(attachContentQuality) };
    },

    async recommendPosts(query = {}) {
      const page = Math.max(1, Number(query.page) || 1);
      const pageSize = Math.max(1, Math.min(100, Number(query.pageSize) || Number(query.limit) || 20));
      const candidateLimit = Math.max(page * pageSize, Math.min(400, Number(query.candidateLimit) || 200));
      const data = await postRepository.list({ ...query, page: 1, pageSize: candidateLimit, groupId: null });
      const ranked = scoreRecommendedPosts(data.items || [], query).map(attachContentQuality);
      const start = (page - 1) * pageSize;
      return {
        items: ranked.slice(start, start + pageSize),
        total: ranked.length,
        page,
        pageSize,
        algorithm: "tag_user_embedding_collaborative_filtering_similar_posts_v1",
      };
    },

    async searchPosts(query = {}) {
      const page = Math.max(1, Number(query.page) || 1);
      const pageSize = Math.max(1, Math.min(100, Number(query.pageSize) || Number(query.limit) || 20));
      const candidateLimit = Math.max(page * pageSize, Math.min(500, Number(query.candidateLimit) || 250));
      const data = await postRepository.list({
        ...query,
        page: 1,
        pageSize: candidateLimit,
        groupId: null,
        keyword: query.q || query.keyword || undefined,
      });
      const ranked = scoreSearchPosts(data.items || [], query).map(attachContentQuality);
      const start = (page - 1) * pageSize;
      return {
        items: ranked.slice(start, start + pageSize),
        total: ranked.length,
        page,
        pageSize,
        algorithm: "text_relevance_popularity_recency_relationship_boost_v1",
      };
    },

    async trendingPosts(query = {}) {
      const page = Math.max(1, Number(query.page) || 1);
      const pageSize = Math.max(1, Math.min(100, Number(query.pageSize) || Number(query.limit) || 20));
      const candidateLimit = Math.max(page * pageSize, Math.min(500, Number(query.candidateLimit) || 250));
      const data = await postRepository.list({ ...query, page: 1, pageSize: candidateLimit, groupId: null });
      const ranked = scoreTrendingPosts(data.items || [], query).map(attachContentQuality);
      const start = (page - 1) * pageSize;
      return {
        items: ranked.slice(start, start + pageSize),
        total: ranked.length,
        page,
        pageSize,
        algorithm: "engagement_velocity_time_decay_spam_penalty_v1",
      };
    },

    async getRankedFeed(query = {}) {
      const page = Math.max(1, Number(query.page) || 1);
      const pageSize = Math.max(1, Math.min(100, Number(query.pageSize) || 20));
      const candidateLimit = Math.max(page * pageSize, Math.min(300, Number(query.candidateLimit) || 150));

      const data = await postRepository.list({
        ...query,
        page: 1,
        pageSize: candidateLimit,
        groupId: query.groupId === undefined ? null : query.groupId,
        moderationStatus: "approved",
      });

      const ranked = rankFeed(data.items || [], query).map(attachContentQuality);
      const start = (page - 1) * pageSize;

      return {
        items: ranked.slice(start, start + pageSize),
        total: ranked.length,
        page,
        pageSize,
        algorithm: "freshness_affinity_engagement_quality_diversity_negative_feedback_v1",
      };
    },

    async adminListPosts(query) {
      return postRepository.adminList(query);
    },

    async deletePost(id) {
      return postRepository.remove(id);
    },

    async moderatePost(id, { moderationStatus, actorId, rejectionReason = "" }) {
      if (!id) throw new Error("postId required");
      if (!["pending", "approved", "rejected"].includes(String(moderationStatus || ""))) {
        throw new Error("moderationStatus invalid");
      }

      const post = await postRepository.getById(id);
      if (!post) throw new Error("post not found");

      return postRepository.update(id, {
        moderationStatus,
        approvedAt: moderationStatus === "approved" ? new Date().toISOString() : null,
        approvedBy: moderationStatus === "approved" || moderationStatus === "rejected" ? String(actorId || "") || null : null,
        rejectionReason: moderationStatus === "rejected" ? String(rejectionReason || "").trim() : "",
      });
    },

    async toggleLike(postId, userId) {
      if (!postId) throw new Error("postId required");
      if (!userId) throw new Error("userId required");

      const result = await postRepository.toggleLike(postId, String(userId));
      if (!result) throw new Error("post not found");

      return result;
    },

    async sharePost(postId) {
      if (!postId) throw new Error("postId required");

      const post = await postRepository.incrementShareCount(postId);
      if (!post) throw new Error("post not found");

      return post;
    },

    async listComments(postId, { page = 1, pageSize = 20 } = {}) {
      if (!commentService) {
        throw new Error("commentService not configured");
      }

      return commentService.listCommentsByPost({
        postId,
        page,
        pageSize,
      });
    },

    async createComment(postId, { authorId, content }, traceId) {
      if (!commentService) {
        throw new Error("commentService not configured");
      }

      return commentService.createComment(
        {
          postId,
          authorId,
          content,
        },
        traceId
      );
    },

    async getAdminStats() {
      return postRepository.getAdminStats();
    },
  };
}

module.exports = { createPostService };
