function createCommentController({ commentService }) {
  return {
    async create(req, res) {
      try {
        const traceId = req.headers["x-correlation-id"] || null;
        const comment = await commentService.createComment(req.body, traceId);
        res.status(201).json(comment);
      } catch (e) {
        res.status(400).json({ error: e.message });
      }
    },

    async listByPost(req, res) {
      try {
        const page = parseInt(req.query.page || "1", 10);
        const pageSize = parseInt(req.query.pageSize || "20", 10);
        const data = await commentService.listCommentsByPost({
          postId: req.params.postId,
          page,
          pageSize
        });
        res.json(data);
      } catch (e) {
        res.status(400).json({ error: e.message });
      }
    },

    async remove(req, res) {
      await commentService.deleteComment(req.params.id);
      res.json({ ok: true });
    }
  };
}

module.exports = { createCommentController };
