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
          {
            ...req.body,
            authorId,
          },
          traceId
        );

        return res.status(201).json(post);
      } catch (e) {
        return res.status(400).json({ error: e.message || "CREATE_POST_FAILED" });
      }
    },

    async getById(req, res) {
      try {
        const post = await postService.getPost(req.params.id);
        if (!post) {
          return res.status(404).json({ error: "NOT_FOUND" });
        }

        return res.json(post);
      } catch (e) {
        return res.status(400).json({ error: e.message || "GET_POST_FAILED" });
      }
    },

    async list(req, res) {
      try {
        const page = parseInt(req.query.page || "1", 10);
        const pageSize = parseInt(req.query.pageSize || "20", 10);
        const authorId = req.query.authorId || null;

        const data = await postService.listPosts({
          page,
          pageSize,
          authorId,
        });

        return res.json(data);
      } catch (e) {
        return res.status(400).json({ error: e.message || "LIST_POSTS_FAILED" });
      }
    },

    async remove(req, res) {
      try {
        await postService.deletePost(req.params.id);
        return res.json({ ok: true });
      } catch (e) {
        return res.status(400).json({ error: e.message || "DELETE_POST_FAILED" });
      }
    },

    async toggleLike(req, res) {
      try {
        const userId =
          req.headers["x-user-id"] ||
          req.headers["X-User-Id"] ||
          req.body.userId;

        const data = await postService.toggleLike(req.params.id, userId);
        return res.json(data);
      } catch (e) {
        return res.status(400).json({ error: e.message || "TOGGLE_LIKE_FAILED" });
      }
    },

    async share(req, res) {
      try {
        const data = await postService.sharePost(req.params.id);
        return res.json(data);
      } catch (e) {
        return res.status(400).json({ error: e.message || "SHARE_POST_FAILED" });
      }
    },

    async listComments(req, res) {
      try {
        const page = parseInt(req.query.page || "1", 10);
        const pageSize = parseInt(req.query.pageSize || "20", 10);

        const data = await postService.listComments(req.params.id, {
          page,
          pageSize,
        });

        return res.json(data);
      } catch (e) {
        return res.status(400).json({ error: e.message || "LIST_COMMENTS_FAILED" });
      }
    },

    async createComment(req, res) {
      try {
        const traceId = req.headers["x-correlation-id"] || null;

        const authorId =
          req.headers["x-user-id"] ||
          req.headers["X-User-Id"] ||
          req.body.authorId;

        const comment = await postService.createComment(
          req.params.id,
          {
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
  };
}

module.exports = { createPostController };