const { EVENTS } = require("../../config/constants");

function createPostCreatedPublisher({ broker }) {
  return {
    async publish({ post, traceId }) {
      return broker.publish(
        EVENTS.POST_CREATED,
        {
          postId: String(post._id),
          authorId: String(post.authorId),
          title: post.title,
          createdAt: post.createdAt
        },
        { traceId: traceId || null }
      );
    },
  };
}

module.exports = { createPostCreatedPublisher };
