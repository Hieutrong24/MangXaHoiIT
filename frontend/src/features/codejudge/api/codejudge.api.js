import { http } from '../../../services/http';

function unwrapEnvelope(res) {
  const payload = res?.data;
  return payload?.data ?? payload ?? res;
}

function normalizeSubmissionStatus(data) {
  const numeric = Number(data?.statusValue ?? data?.status);
  if (Number.isFinite(numeric)) return numeric;

  const text = String(data?.status || "").trim().toLowerCase();
  switch (text) {
    case "queued":
      return 1;
    case "running":
      return 2;
    case "ac":
      return 3;
    case "wa":
      return 4;
    case "tle":
      return 5;
    case "mle":
      return 6;
    case "re":
      return 7;
    case "ce":
      return 8;
    default:
      return NaN;
  }
}

export const codejudgeApi = {
  async listProblems(params = {}) {
    const res = await http.get('/code/problems', { params });
    return unwrapEnvelope(res);
  },

  async listProblemsOj(params = {}) {
    const res = await http.get('/code/problems/oj', { params });
    return unwrapEnvelope(res);
  },

  async listFeaturedProblems(params = {}) {
    const res = await http.get('/code/problems/featured', { params });
    return unwrapEnvelope(res);
  },

  async getProblem(id) {
    const res = await http.get(`/code/problems/${encodeURIComponent(id)}`);
    return unwrapEnvelope(res);
  },

  async getProblemOverview(id) {
    const res = await http.get(`/code/problems/${encodeURIComponent(id)}/overview`);
    return unwrapEnvelope(res);
  },

  async listProblemTestCases(problemId) {
    const res = await http.get(`/code/testcases/by-problem/${encodeURIComponent(problemId)}`);
    return unwrapEnvelope(res);
  },

  async listLanguages() {
    const res = await http.get('/code/languages');
    return unwrapEnvelope(res);
  },

  async submit(payload) {
    const res = await http.post('/code/submissions', payload);
    return unwrapEnvelope(res);
  },

  async getSubmission(id) {
    const res = await http.get(`/code/submissions/${encodeURIComponent(id)}`);
    return unwrapEnvelope(res);
  },

  async getSubmissionResult(id) {
    const res = await http.get(`/code/submissions/${encodeURIComponent(id)}/result`);
    return unwrapEnvelope(res);
  },

  async pollSubmission(id, interval = 1000, timeout = 45000) {
    const start = Date.now();

    return new Promise((resolve, reject) => {
      const timer = setInterval(async () => {
        try {
          const data = await this.getSubmission(id);
          const statusCode = normalizeSubmissionStatus(data);
          const isPending = statusCode === 1 || statusCode === 2;

          if (!isPending && Number.isFinite(statusCode) && statusCode >= 3) {
            clearInterval(timer);
            resolve(data);
            return;
          }

          if (Date.now() - start > timeout) {
            clearInterval(timer);
            reject(new Error('Polling timeout'));
          }
        } catch (err) {
          clearInterval(timer);
          reject(err);
        }
      }, interval);
    });
  },

  async run(payload) {
    const res = await http.post('/code/run', payload);
    return unwrapEnvelope(res);
  },

  async getLearnDashboard(params = {}) {
    const res = await http.get('/code/learn/dashboard', { params });
    return unwrapEnvelope(res);
  },

  async listLearningPaths(params = {}) {
    const res = await http.get('/code/learn/paths', { params });
    return unwrapEnvelope(res);
  },

  async getLearningPath(slug, params = {}) {
    const res = await http.get(`/code/learn/paths/${encodeURIComponent(slug)}`, { params });
    return unwrapEnvelope(res);
  },

  async getLesson(lessonId, params = {}) {
    const res = await http.get(`/code/learn/lessons/${encodeURIComponent(lessonId)}`, { params });
    return unwrapEnvelope(res);
  },

  async completeLesson(lessonId, payload = {}) {
    const res = await http.post(`/code/learn/lessons/${encodeURIComponent(lessonId)}/complete`, payload);
    return unwrapEnvelope(res);
  },

  async getQuiz(quizId, params = {}) {
    const res = await http.get(`/code/quizzes/${encodeURIComponent(quizId)}`, { params });
    return unwrapEnvelope(res);
  },

  async submitQuizAttempt(quizId, payload = {}) {
    const res = await http.post(`/code/quizzes/${encodeURIComponent(quizId)}/attempts`, payload);
    return unwrapEnvelope(res);
  },
};
