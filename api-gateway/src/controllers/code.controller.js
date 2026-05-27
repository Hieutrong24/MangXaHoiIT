const { codejudgeClient } = require("../clients/codejudge.client");

function ctxFromReq(req) {
  return {
    correlationId: req.correlationId,
    authHeader: req.authHeader,
    user: req.user,
  };
}

function resolveUserId(req) {
  return req.user?.id || req.query?.userId || req.body?.userId || undefined;
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

  async listProblemsOj(req, res, next) {
    try {
      const data = await codejudgeClient.listProblemsOj({ ...req.query, userId: resolveUserId(req) }, ctxFromReq(req));
      return res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      return next(e);
    }
  },

  async listFeaturedProblems(req, res, next) {
    try {
      const data = await codejudgeClient.listFeaturedProblems({ ...req.query, userId: resolveUserId(req) }, ctxFromReq(req));
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

  async getProblemOverview(req, res, next) {
    try {
      const data = await codejudgeClient.getProblemOverview(req.params.id, { ...req.query, userId: resolveUserId(req) }, ctxFromReq(req));
      return res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      return next(e);
    }
  },

  async listTestCasesByProblem(req, res, next) {
    try {
      const data = await codejudgeClient.listTestCasesByProblem(req.params.problemId, ctxFromReq(req));
      return res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      return next(e);
    }
  },

  async createSubmission(req, res, next) {
    try {
      const body = { ...req.body, userId: resolveUserId(req) };
      const data = await codejudgeClient.createSubmission(body, ctxFromReq(req));
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

  async getSubmissionResult(req, res, next) {
    try {
      const data = await codejudgeClient.getSubmissionResult(req.params.id, ctxFromReq(req));
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

  async getLearnDashboard(req, res, next) {
    try {
      const data = await codejudgeClient.getLearnDashboard({ ...req.query, userId: resolveUserId(req) }, ctxFromReq(req));
      return res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      return next(e);
    }
  },

  async listLearningPaths(req, res, next) {
    try {
      const data = await codejudgeClient.listLearningPaths({ ...req.query, userId: resolveUserId(req) }, ctxFromReq(req));
      return res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      return next(e);
    }
  },

  async getLearningPath(req, res, next) {
    try {
      const data = await codejudgeClient.getLearningPath(req.params.slug, { ...req.query, userId: resolveUserId(req) }, ctxFromReq(req));
      return res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      return next(e);
    }
  },

  async getLesson(req, res, next) {
    try {
      const data = await codejudgeClient.getLesson(req.params.lessonId, { ...req.query, userId: resolveUserId(req) }, ctxFromReq(req));
      return res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      return next(e);
    }
  },

  async completeLesson(req, res, next) {
    try {
      const data = await codejudgeClient.completeLesson(req.params.lessonId, { ...req.body, userId: resolveUserId(req) }, ctxFromReq(req));
      return res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      return next(e);
    }
  },

  async getQuiz(req, res, next) {
    try {
      const data = await codejudgeClient.getQuiz(req.params.quizId, { ...req.query, userId: resolveUserId(req) }, ctxFromReq(req));
      return res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      return next(e);
    }
  },

  async submitQuizAttempt(req, res, next) {
    try {
      const data = await codejudgeClient.submitQuizAttempt(req.params.quizId, { ...req.body, userId: resolveUserId(req) }, ctxFromReq(req));
      return res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      return next(e);
    }
  },
};

module.exports = { codeController };
