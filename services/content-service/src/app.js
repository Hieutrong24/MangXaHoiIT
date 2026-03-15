const express = require("express");
const { buildPostRoutes } = require("./modules/post/post.routes");
const { buildCommentRoutes } = require("./modules/comment/comment.routes");
const { buildUploadRoutes } = require("./modules/upload/upload.routes");
const aiRoutes = require("./modules/ai/ai.routes");

function buildApp({
  env,
  broker,
  postController,
  commentController,
  uploadController,
}) {
  const app = express();

  app.use(express.json({ limit: "2mb" }));

  app.get("/health", (_req, res) =>
    res.json({
      ok: true,
      service: "content-service",
      env: env?.NODE_ENV || "development",
      broker: broker?.driver || env?.BROKER_DRIVER || "unknown",
      exchange: env?.RABBIT_EXCHANGE || "events",
    })
  );

  app.get("/", (_req, res) =>
    res.json({
      ok: true,
      service: "content-service",
      endpoints: {
        health: "/health",
        posts: "/api/posts",
        comments: "/api/comments",
        commentsByPost: "/api/comments/by-post/:postId",
        uploads: "/api/uploads/cloudinary",
        ai: "/api/ai",
      },
    })
  );

  app.use("/api/ai", aiRoutes);
  app.use("/api/posts", buildPostRoutes({ postController }));
  app.use("/api/comments", buildCommentRoutes({ commentController }));
  app.use("/api/uploads", buildUploadRoutes({ uploadController }));

  app.use((req, res) => {
    res.status(404).json({
      error: "Route not found",
      method: req.method,
      path: req.originalUrl,
    });
  });

  app.use((err, _req, res, _next) => {
    console.error("[content-service] express error:", err);
    res.status(500).json({
      error: "Internal Server Error",
    });
  });

  return app;
}

module.exports = { buildApp };