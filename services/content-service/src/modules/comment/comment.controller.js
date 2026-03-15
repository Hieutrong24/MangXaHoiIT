function createCommentController({ commentService }) {
  return {
    async create(req, res) {
      try {
        const traceId = req.headers["x-correlation-id"] || null;

        const authorId =
          req.headers["x-user-id"] ||
          req.headers["X-User-Id"] ||
          req.body.authorId;

        const comment = await commentService.createComment(
          {
            postId: req.body.postId,
            authorId,
            content: req.body.content,
          },
          traceId
        );

        return res.status(201).json(comment);
      } catch (e) {
        return res.status(400).json({ error: e.message || "CREATE_COMMENT_FAILED" });
      }
    },

    async listByPost(req, res) {
      try {
        const page = parseInt(req.query.page || "1", 10);
        const pageSize = parseInt(req.query.pageSize || "20", 10);

        const data = await commentService.listCommentsByPost({
          postId: req.params.postId,
          page,
          pageSize,
        });

        return res.json(data);
      } catch (e) {
        return res.status(400).json({ error: e.message || "LIST_COMMENTS_FAILED" });
      }
    },

    async remove(req, res) {
      try {
        await commentService.deleteComment(req.params.id);
        return res.json({ ok: true });
      } catch (e) {
        return res.status(400).json({ error: e.message || "DELETE_COMMENT_FAILED" });
      }
    },
  };
}

module.exports = { createCommentController };