const express = require("express");
const { buildPostRoutes } = require("./modules/post/post.routes");
const { buildCommentRoutes } = require("./modules/comment/comment.routes");
const { buildUploadRoutes } = require("./modules/upload/upload.routes");
const { buildGroupRoutes } = require("./modules/group/group.routes");
const { buildJobRoutes } = require("./modules/job/job.routes");
const { buildAdminRoutes } = require("./modules/admin/admin.routes");
const aiRoutes = require("./modules/ai/ai.routes");

function buildApp({
  env,
  broker,
  postController,
  commentController,
  uploadController,
  groupController,
  jobController,
  adminController,
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
        groups: "/api/groups",
        jobs: "/api/jobs",
        comments: "/api/comments",
        commentsByPost: "/api/comments/by-post/:postId",
        uploads: "/api/uploads/cloudinary",
        ai: "/api/ai",
        storage: env?.CONTENT_STORAGE_DRIVER || "mongo",
      },
    })
  );

  app.use("/api/ai", aiRoutes);
  app.get("/api/feed", postController.feed);
  app.get("/api/search", postController.search);
  app.use("/api/posts", buildPostRoutes({ postController }));
  app.use("/api/comments", buildCommentRoutes({ commentController }));
  app.use("/api/groups", buildGroupRoutes({ groupController }));
  app.use("/api/jobs", buildJobRoutes({ jobController }));
  app.use("/api/uploads", buildUploadRoutes({ uploadController }));
  app.use("/api/admin", buildAdminRoutes({ adminController }));

  app.use((req, res) => {
    res.status(404).json({ error: "Route not found", method: req.method, path: req.originalUrl });
  });

  app.use((err, _req, res, _next) => {
    console.error("[content-service] express error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  });

  return app;
}

module.exports = { buildApp };
