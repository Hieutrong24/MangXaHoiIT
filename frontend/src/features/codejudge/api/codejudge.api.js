// src/features/codejudge/api/codejudge.api.js
import { http } from "../../../services/http";

function unwrap(res) {
  return res?.data ?? res;
}

export const codejudgeApi = {

  async listProblems(params = {}) {
    const res = await http.get("/code/problems", { params });
    return unwrap(res);
  },

  async getProblem(id) {
    const res = await http.get(`/code/problems/${encodeURIComponent(id)}`);
    return unwrap(res);
  },


  async listLanguages() {
    const res = await http.get("/code/languages");
    return unwrap(res);
  },


  async submit(payload) {
    const res = await http.post("/code/submissions", payload);
    return unwrap(res);
  },

  async getSubmission(id) {
    const res = await http.get(`/code/submissions/${encodeURIComponent(id)}`);
    return unwrap(res);
  },

  async pollSubmission(id, interval = 1000, timeout = 15000) {
    const start = Date.now();

    return new Promise((resolve, reject) => {
      const timer = setInterval(async () => {
        try {
          const data = await this.getSubmission(id);

          if (data?.status === "Done" || data?.status === "Failed" || data?.verdict) {
            clearInterval(timer);
            resolve(data);
          }

          if (Date.now() - start > timeout) {
            clearInterval(timer);
            reject(new Error("Polling timeout"));
          }
        } catch (err) {
          clearInterval(timer);
          reject(err);
        }
      }, interval);
    });
  },

 

  async run(payload) {
      
    const res = await http.post("/code/run", payload);
    return unwrap(res);
  },

 
  async runSubmit(payload) {
    const res = await http.post("/api/codejudge/run/submit", payload);
    return unwrap(res);
  },

  async runGetResult(token) {
    const res = await http.get(`/api/codejudge/run/${encodeURIComponent(token)}`);
    return unwrap(res);
  },
};