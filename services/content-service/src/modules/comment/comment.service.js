const mongoose = require("mongoose");

function createCommentService({ commentRepository, commentCreatedPublisher, postRepository }) {
  return {
    async createComment({ postId, authorId, content }, traceId) {
      if (!postId) throw new Error("postId required");
      if (!authorId) throw new Error("authorId required");
      if (!content || !content.trim()) throw new Error("content required");

      if (!mongoose.isValidObjectId(postId)) throw new Error("postId invalid");

      const post = await postRepository.getById(postId);
      if (!post) throw new Error("post not found");

      const comment = await commentRepository.create({
        postId,
        authorId: String(authorId),
        content: content.trim()
      });

      await commentCreatedPublisher.publish({ comment, traceId });

      return comment;
    },

    async listCommentsByPost({ postId, page, pageSize }) {
      if (!mongoose.isValidObjectId(postId)) throw new Error("postId invalid");
      return commentRepository.listByPost({ postId, page, pageSize });
    },

    async deleteComment(id) {
      return commentRepository.remove(id);
    }
  };
}

module.exports = { createCommentService };
