const mongoose = require("mongoose");
const { assessCommentSpam } = require("../post/spam-detector");

function createCommentService({
  commentRepository,
  commentCreatedPublisher,
  postRepository,
}) {
  return {
    async createComment({ postId, authorId, content }, traceId) {
      if (!postId) throw new Error("postId required");
      if (!authorId) throw new Error("authorId required");
      if (!content || !content.trim()) throw new Error("content required");

      if (!mongoose.isValidObjectId(postId)) {
        throw new Error("postId invalid");
      }

      const post = await postRepository.getById(postId);
      if (!post) throw new Error("post not found");

      const recentComments = commentRepository.listRecentByAuthor
        ? await commentRepository.listRecentByAuthor({ authorId: String(authorId), minutes: 60, limit: 80 })
        : [];
      const spam = assessCommentSpam({ content, recentComments });
      if (spam.status !== "clear") {
        throw new Error(`comment blocked by spam detector: ${spam.reasons.join(", ") || "spam"}`);
      }

      const comment = await commentRepository.create({
        postId,
        authorId: String(authorId),
        content: content.trim(),
      });

      await postRepository.incrementCommentCount(postId, 1);

      if (commentCreatedPublisher?.publish) {
        try {
          await commentCreatedPublisher.publish({ comment, traceId });
        } catch (error) {
          console.warn("[content-service] comment.created publish skipped:", error?.message || error);
        }
      }

      return comment;
    },

    async listCommentsByPost({ postId, page, pageSize }) {
      if (!mongoose.isValidObjectId(postId)) {
        throw new Error("postId invalid");
      }

      return commentRepository.listByPost({ postId, page, pageSize });
    },

    async deleteComment(id) {
      if (!id) throw new Error("comment id required");
      if (!mongoose.isValidObjectId(id)) throw new Error("comment id invalid");

      const existing = await commentRepository.getById(id);
      if (!existing) {
        throw new Error("comment not found");
      }

      const deleted = await commentRepository.remove(id);
      await postRepository.decrementCommentCount(existing.postId, 1);

      return deleted;
    },

    async adminListComments(query = {}) {
      return commentRepository.adminList(query);
    },

    async getAdminStats() {
      return commentRepository.getAdminStats();
    },
  };
}

module.exports = { createCommentService };
