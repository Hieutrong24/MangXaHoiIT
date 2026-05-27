const express = require("express");

function buildAdminRoutes({ adminController }) {
  const router = express.Router();

  router.get("/dashboard", adminController.dashboard);
  router.get("/posts", adminController.listPosts);
  router.patch("/posts/:id/moderation", adminController.moderatePost);
  router.get("/comments", adminController.listComments);
  router.delete("/comments/:id", adminController.deleteComment);
  router.get("/groups", adminController.listGroups);
  router.get("/groups/:id", adminController.getGroup);
  router.get("/groups/:id/stats", adminController.getGroupStats);
  router.delete("/groups/:id", adminController.deleteGroup);

  return router;
}

module.exports = { buildAdminRoutes };
