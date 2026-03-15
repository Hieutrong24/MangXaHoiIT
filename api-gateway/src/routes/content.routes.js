const express = require("express");
const { contentController } = require("../controllers/content.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

const router = express.Router();

// Public routes
router.get("/feed", contentController.getFeed);
router.get("/posts", contentController.listPosts);
router.get("/posts/:id", contentController.getPostById);
router.get("/posts/:id/comments", contentController.listComments);

// Protected routes
router.use(authMiddleware());

router.post("/posts", contentController.createPost);
router.post("/posts/:id/like", contentController.toggleLike);
router.post("/posts/:id/share", contentController.sharePost);
router.post("/posts/:id/comments", contentController.createComment);

module.exports = { contentRoutes: router };