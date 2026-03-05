const router = require("express").Router();

function buildPostRoutes({ postController }) {
  router.get("/", postController.list);
  router.post("/", postController.create);
  router.get("/:id", postController.getById);
  router.delete("/:id", postController.remove);
  return router;
}

module.exports = { buildPostRoutes };
