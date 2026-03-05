const express = require("express");
const { buildPostRoutes } = require("./modules/post/post.routes");
const { buildCommentRoutes } = require("./modules/comment/comment.routes");
const aiRoutes = require("./modules/ai/ai.routes");
function buildApp({ postController, commentController }) {
  const app = express();
  app.use(express.json({ limit: "2mb" }));
  app.use("/api/ai", aiRoutes);
  app.get("/health", (req, res) => res.json({ ok: true }));

  app.get("/", (req, res) =>
    res.json({
      ok: true,
      service: "content-service",
      endpoints: {
        health: "/health",
        posts: "/api/posts",
        comments: "/api/comments",
        commentsByPost: "/api/comments/by-post/:postId"
      }
    })
  );

  app.use("/api/posts", buildPostRoutes({ postController }));
  app.use("/api/comments", buildCommentRoutes({ commentController }));

  return app;
}

module.exports = { buildApp };
