// src/controllers/auth.controller.js
const { authClient } = require("../clients/auth.client");

function ctxFromReq(req) {
  return {
    correlationId: req.correlationId,
    authHeader: req.authHeader, // may be undefined
    user: req.user, // may be undefined
  };
}

const authController = {
  async login(req, res, next) {
    try {
      const data = await authClient.login(req.body, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },

  async refresh(req, res, next) {
    try {
      const data = await authClient.refresh(req.body, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },

  async logout(req, res, next) {
    try {
      const data = await authClient.logout(req.body, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },
};

module.exports = { authController };
