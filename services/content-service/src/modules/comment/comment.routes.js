const router = require("express").Router();

function buildCommentRoutes({ commentController }) {
  router.get("/by-post/:postId", commentController.listByPost);
  router.post("/", commentController.create);
  router.delete("/:id", commentController.remove);
  return router;
}

module.exports = { buildCommentRoutes };
