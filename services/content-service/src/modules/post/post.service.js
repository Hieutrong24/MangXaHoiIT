const mongoose = require("mongoose");

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

      const post = await postRepository.create({
        authorId: String(authorId),
        title: title.trim(),
        content: content.trim(),
        tags: normalizeTags(tags),
        isPublic: isPublic !== false,
        media: normalizedMedia,
      });

      if (postCreatedPublisher?.publish) {
        await postCreatedPublisher.publish({ post, traceId });
      }

      return post;
    },

    async getPost(id) {
      if (!mongoose.isValidObjectId(id)) return null;
      return postRepository.getById(id);
    },

    async listPosts(query) {
      return postRepository.list(query);
    },

    async deletePost(id) {
      return postRepository.remove(id);
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
  };
}

module.exports = { createPostService };