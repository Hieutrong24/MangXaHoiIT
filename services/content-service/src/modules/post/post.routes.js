const express = require("express");

function buildPostRoutes({ postController }) {
  const router = express.Router();

  router.get("/", postController.list);
  router.post("/", postController.create);

  router.get("/:id", postController.getById);
  router.delete("/:id", postController.remove);

  router.post("/:id/like", postController.toggleLike);
  router.post("/:id/share", postController.share);

  router.get("/:id/comments", postController.listComments);
  router.post("/:id/comments", postController.createComment);

  return router;
}

module.exports = { buildPostRoutes };