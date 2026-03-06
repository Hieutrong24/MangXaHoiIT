// src/clients/codejudge.client.js
const { env } = require("../config/env");
const { createHttpClient } = require("../utils/httpClient");
const { SERVICE_NAMES } = require("../config/constants");

const http = createHttpClient({
  baseURL: env.CODEJUDGE_SERVICE_URL,
  serviceName: SERVICE_NAMES.CODEJUDGE,
});

function enc(x) {
  return encodeURIComponent(String(x));
}

const codejudgeClient = {


  async listLanguages(ctx) {
    // GET /languages
    const res = await http.get("/languages", { __ctx: ctx });
    return res.data;
  },



  async listProblems(query = {}, ctx) {
    const res = await http.get("/problems", { params: query, __ctx: ctx });
    return res.data;
  },

  async getProblemById(id, ctx) {
    const res = await http.get(`/problems/${enc(id)}`, { __ctx: ctx });
    return res.data;
  },



  async createSubmission(body, ctx) {
    const res = await http.post("/submissions", body, { __ctx: ctx });
    return res.data;
  },

  async getSubmissionById(id, ctx) {
    const res = await http.get(`/submissions/${enc(id)}`, { __ctx: ctx });
    return res.data;
  },

  
  async run(body, ctx) {
    const res = await http.post("/codejudge/run", body, { __ctx: ctx });
    return res.data;
  },
};

module.exports = { codejudgeClient };