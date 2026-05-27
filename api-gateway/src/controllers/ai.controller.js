const { aiClient } = require("../clients/ai.client");

function ctxFromReq(req) {
  return {
    correlationId: req.correlationId,
    authHeader: req.authHeader,
    user: req.user,
  };
}

const aiController = {
  async getSuggestion(req, res, next) {
    try {
      const data = await aiClient.getSuggestion(ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },
};

module.exports = { aiController };