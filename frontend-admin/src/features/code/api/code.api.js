import { http } from '../../../services/http';

export const codeAdminApi = {
  async listProblems(params) {
    const res = await http.get('/admin/code/problems', { params });
    return res.data;
  },
  async getProblem(problemId) {
    const res = await http.get(`/admin/code/problems/${encodeURIComponent(problemId)}`);
    return res.data;
  },
  async createProblem(body) {
    const res = await http.post('/admin/code/problems', body);
    return res.data;
  },
  async updateProblem(problemId, body) {
    const res = await http.put(`/admin/code/problems/${encodeURIComponent(problemId)}`, body);
    return res.data;
  },
  async removeProblem(problemId) {
    const res = await http.delete(`/admin/code/problems/${encodeURIComponent(problemId)}`);
    return res.data;
  },
  async getOverview(problemId) {
    const res = await http.get(`/admin/code/problems/${encodeURIComponent(problemId)}/overview`);
    return res.data;
  },
  async listTestCases(problemId) {
    const res = await http.get(`/admin/code/problems/${encodeURIComponent(problemId)}/testcases`);
    return res.data;
  },
  async createTestCase(problemId, body) {
    const res = await http.post(`/admin/code/problems/${encodeURIComponent(problemId)}/testcases`, body);
    return res.data;
  },
  async updateTestCase(testCaseId, body) {
    const res = await http.put(`/admin/code/testcases/${encodeURIComponent(testCaseId)}`, body);
    return res.data;
  },
  async removeTestCase(testCaseId) {
    const res = await http.delete(`/admin/code/testcases/${encodeURIComponent(testCaseId)}`);
    return res.data;
  },
  async listSubmissions(params) {
    const res = await http.get('/admin/code/submissions', { params });
    return res.data;
  },
  async getSubmission(submissionId) {
    const res = await http.get(`/admin/code/submissions/${encodeURIComponent(submissionId)}`);
    return res.data;
  },
  async getSubmissionResult(submissionId) {
    const res = await http.get(`/admin/code/submissions/${encodeURIComponent(submissionId)}/result`);
    return res.data;
  },
  async rejudge(submissionId) {
    const res = await http.post(`/admin/code/submissions/${encodeURIComponent(submissionId)}/rejudge`);
    return res.data;
  },
  async cancel(submissionId) {
    const res = await http.post(`/admin/code/submissions/${encodeURIComponent(submissionId)}/cancel`);
    return res.data;
  },
};
