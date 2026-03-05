// src/controllers/content.controller.js
const { contentClient } = require("../clients/content.client");

function ctxFromReq(req) {
  return {
    correlationId: req.correlationId,
    authHeader: req.authHeader,
    user: req.user,
  };
}

const contentController = {
  async getFeed(req, res, next) {
    try {
      const data = await contentClient.getFeed(req.query, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },

  async createPost(req, res, next) {
    try {
      const data = await contentClient.createPost(req.body, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },

  async getPostById(req, res, next) {
    try {
      const data = await contentClient.getPostById(req.params.id, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },

  async createComment(req, res, next) {
    try {
      const data = await contentClient.createComment(req.params.id, req.body, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },
};

module.exports = { contentController };
