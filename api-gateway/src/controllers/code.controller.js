// src/controllers/code.controller.js
const { codejudgeClient } = require("../clients/codejudge.client");

function ctxFromReq(req) {
  return {
    correlationId: req.correlationId,
    authHeader: req.authHeader, 
    user: req.user,
  };
}

const codeController = {
  async listLanguages(req, res, next) {
    try {
      const data = await codejudgeClient.listLanguages(ctxFromReq(req));
      return res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      return next(e);
    }
  },

  async listProblems(req, res, next) {
    try {
      const data = await codejudgeClient.listProblems(req.query, ctxFromReq(req));
      return res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      return next(e);
    }
  },

  async getProblemById(req, res, next) {
    try {
      const data = await codejudgeClient.getProblemById(req.params.id, ctxFromReq(req));
      return res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      return next(e);
    }
  },

  async createSubmission(req, res, next) {
    try {
      const data = await codejudgeClient.createSubmission(req.body, ctxFromReq(req));
      return res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      return next(e);
    }
  },

  async getSubmissionById(req, res, next) {
    try {
      const data = await codejudgeClient.getSubmissionById(req.params.id, ctxFromReq(req));
      return res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      return next(e);
    }
  },

  async run(req, res, next) {
    try {
      const data = await codejudgeClient.run(req.body, ctxFromReq(req));
      return res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      return next(e);
    }
  },
};

module.exports = { codeController };