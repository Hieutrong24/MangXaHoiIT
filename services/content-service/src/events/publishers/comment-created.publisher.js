const { EVENTS } = require("../../config/constants");

function createCommentCreatedPublisher({ broker }) {
  return {
    async publish({ comment, traceId }) {
      return broker.publish(
        EVENTS.COMMENT_CREATED,
        {
          commentId: String(comment._id),
          postId: String(comment.postId),
          authorId: String(comment.authorId),
          content: comment.content,
          createdAt: comment.createdAt
        },
        { traceId: traceId || null }
      );
    },
  };
}

module.exports = { createCommentCreatedPublisher };
