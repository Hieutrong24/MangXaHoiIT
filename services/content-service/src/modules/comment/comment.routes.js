const express = require("express");

function buildCommentRoutes({ commentController }) {
  const router = express.Router();

  router.get("/by-post/:postId", commentController.listByPost);
  router.post("/", commentController.create);
  router.delete("/:id", commentController.remove);

  return router;
}

module.exports = { buildCommentRoutes };