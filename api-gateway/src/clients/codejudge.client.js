const { env } = require("../config/env");
const { createHttpClient } = require("../utils/httpClient");
const { SERVICE_NAMES } = require("../config/constants");

const http = createHttpClient({
  baseURL: env.CODEJUDGE_SERVICE_URL,
  serviceName: SERVICE_NAMES.CODEJUDGE,
});

const baseUrlPath = (() => {
  try {
    return new URL(env.CODEJUDGE_SERVICE_URL).pathname.replace(/\/+$/, "");
  } catch {
    return "";
  }
})();

const baseUrlHasApiPrefix = baseUrlPath === "/api" || baseUrlPath.endsWith("/api");

function enc(x) {
  return encodeURIComponent(String(x));
}

function api(path) {
  return baseUrlHasApiPrefix ? path : `/api${path}`;
}

const codejudgeClient = {
  async listLanguages(ctx) {
    const res = await http.get(api("/languages"), { __ctx: ctx });
    return res.data;
  },

  async listProblems(query = {}, ctx) {
    const res = await http.get(api("/problems"), { params: query, __ctx: ctx });
    return res.data;
  },

  async listProblemsOj(query = {}, ctx) {
    const res = await http.get(api("/problems/oj"), { params: query, __ctx: ctx });
    return res.data;
  },

  async listFeaturedProblems(query = {}, ctx) {
    const res = await http.get(api("/problems/featured"), { params: query, __ctx: ctx });
    return res.data;
  },

  async getProblemById(id, ctx) {
    const res = await http.get(api(`/problems/${enc(id)}`), { __ctx: ctx });
    return res.data;
  },

  async getProblemOverview(id, query = {}, ctx) {
    const res = await http.get(api(`/problems/${enc(id)}/overview`), { params: query, __ctx: ctx });
    return res.data;
  },

  async listTestCasesByProblem(problemId, ctx) {
    const res = await http.get(api(`/testcases/by-problem/${enc(problemId)}`), { __ctx: ctx });
    return res.data;
  },

  async createSubmission(body, ctx) {
    const res = await http.post(api("/submissions"), body, { __ctx: ctx });
    return res.data;
  },

  async getSubmissionById(id, ctx) {
    const res = await http.get(api(`/submissions/${enc(id)}`), { __ctx: ctx });
    return res.data;
  },

  async getSubmissionResult(id, ctx) {
    const res = await http.get(api(`/submissions/${enc(id)}/result`), { __ctx: ctx });
    return res.data;
  },

  async run(body, ctx) {
    const res = await http.post(api("/codejudge/run"), body, { __ctx: ctx });
    return res.data;
  },

  async getLearnDashboard(query = {}, ctx) {
    const res = await http.get(api("/learn/dashboard"), { params: query, __ctx: ctx });
    return res.data;
  },

  async listLearningPaths(query = {}, ctx) {
    const res = await http.get(api("/learn/paths"), { params: query, __ctx: ctx });
    return res.data;
  },

  async getLearningPath(slug, query = {}, ctx) {
    const res = await http.get(api(`/learn/paths/${enc(slug)}`), { params: query, __ctx: ctx });
    return res.data;
  },

  async getLesson(lessonId, query = {}, ctx) {
    const res = await http.get(api(`/learn/lessons/${enc(lessonId)}`), { params: query, __ctx: ctx });
    return res.data;
  },

  async completeLesson(lessonId, body = {}, ctx) {
    const res = await http.post(api(`/learn/lessons/${enc(lessonId)}/complete`), body, { __ctx: ctx });
    return res.data;
  },

  async getQuiz(quizId, query = {}, ctx) {
    const res = await http.get(api(`/quizzes/${enc(quizId)}`), { params: query, __ctx: ctx });
    return res.data;
  },

  async submitQuizAttempt(quizId, body = {}, ctx) {
    const res = await http.post(api(`/quizzes/${enc(quizId)}/attempts`), body, { __ctx: ctx });
    return res.data;
  },

  async adminCreateProblem(body, ctx) {
    const res = await http.post(api("/problems"), body, { __ctx: ctx });
    return res.data;
  },

  async adminUpdateProblem(id, body, ctx) {
    const res = await http.put(api(`/problems/${enc(id)}`), body, { __ctx: ctx });
    return res.data;
  },

  async adminDeleteProblem(id, ctx) {
    const res = await http.delete(api(`/problems/${enc(id)}`), { __ctx: ctx });
    return res.data;
  },

  async adminCreateTestCase(body, ctx) {
    const res = await http.post(api("/testcases"), body, { __ctx: ctx });
    return res.data;
  },

  async adminUpdateTestCase(id, body, ctx) {
    const res = await http.put(api(`/testcases/${enc(id)}`), body, { __ctx: ctx });
    return res.data;
  },

  async adminDeleteTestCase(id, ctx) {
    const res = await http.delete(api(`/testcases/${enc(id)}`), { __ctx: ctx });
    return res.data;
  },

  async adminListSubmissions(query = {}, ctx) {
    const res = await http.get(api("/submissions"), { params: query, __ctx: ctx });
    return res.data;
  },

  async adminRejudgeSubmission(id, ctx) {
    const res = await http.post(api(`/submissions/${enc(id)}/rejudge`), {}, { __ctx: ctx });
    return res.data;
  },

  async adminCancelSubmission(id, ctx) {
    const res = await http.post(api(`/submissions/${enc(id)}/cancel`), {}, { __ctx: ctx });
    return res.data;
  },

  async adminGetLearningDashboard(ctx) {
    const res = await http.get(api("/admin/learning/dashboard"), { __ctx: ctx });
    return res.data;
  },

  async adminListLearningPaths(query = {}, ctx) {
    const res = await http.get(api("/admin/learning/paths"), { params: query, __ctx: ctx });
    return res.data;
  },

  async adminListLessons(query = {}, ctx) {
    const res = await http.get(api("/admin/learning/lessons"), { params: query, __ctx: ctx });
    return res.data;
  },

  async adminListQuizzes(query = {}, ctx) {
    const res = await http.get(api("/admin/learning/quizzes"), { params: query, __ctx: ctx });
    return res.data;
  },

  async adminListChallenges(query = {}, ctx) {
    const res = await http.get(api("/admin/learning/challenges"), { params: query, __ctx: ctx });
    return res.data;
  },

  async adminListBadges(query = {}, ctx) {
    const res = await http.get(api("/admin/learning/badges"), { params: query, __ctx: ctx });
    return res.data;
  },
};

module.exports = { codejudgeClient };
