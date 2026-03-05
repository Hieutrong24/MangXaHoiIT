const express = require("express");
const { contentController } = require("../controllers/content.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

const router = express.Router();

 
router.get("/feed", contentController.getFeed);

 
router.use(authMiddleware());

router.post("/posts", contentController.createPost);
router.get("/posts/:id", contentController.getPostById);
router.post("/posts/:id/comments", contentController.createComment);

module.exports = { contentRoutes: router };