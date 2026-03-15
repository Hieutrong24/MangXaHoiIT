const aiService = require("../../services/ai.service");
const { createPostRepository } = require("../post/post.repository");

const postRepo = createPostRepository();

exports.getSuggestion = async (req, res, next) => {
  try {
     
    const recentPosts = await postRepo.getRecentPosts(5);

    const posts = recentPosts.map((p) => ({
      title: p.title || "",
      tag: p.tag || "general",
      excerpt: (p.content || "").slice(0, 200),
    }));

    const tags = [...new Set(posts.map((x) => x.tag))].slice(0, 8);

    const suggestion = await aiService.generateSuggestion({
      posts,
      tags,
      user: req.user || null,
    });

    res.json({ success: true, suggestion });
  } catch (err) {
    next(err);
  }
};