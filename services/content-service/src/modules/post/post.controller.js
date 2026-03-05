function createPostController({ postService }) {
  return {
    async create(req, res) {
      try {
        const traceId = req.headers["x-correlation-id"] || null;

        const authorId =
          req.headers["x-user-id"] ||
          req.headers["X-User-Id"] ||
          req.body.authorId;

        const post = await postService.createPost(
          { ...req.body, authorId },
          traceId
        );

        res.status(201).json(post);
      } catch (e) {
        res.status(400).json({ error: e.message });
      }
    },

    async getById(req, res) {
      const post = await postService.getPost(req.params.id);
      if (!post) return res.status(404).json({ error: "NOT_FOUND" });
      res.json(post);
    },

    async list(req, res) {
      const page = parseInt(req.query.page || "1", 10);
      const pageSize = parseInt(req.query.pageSize || "20", 10);
      const authorId = req.query.authorId || null;

      const data = await postService.listPosts({ page, pageSize, authorId });
      res.json(data);
    },

    async remove(req, res) {
      await postService.deletePost(req.params.id);
      res.json({ ok: true });
    }
  };
}

module.exports = { createPostController };
