// src/clients/judge0.client.js
const axios = require("axios");



function requireEnv(name) {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing env ${name}`);
  }
  return v;
}

const BASE_URL = process.env.JUDGE0_BASE_URL || "https://judge0-ce.p.rapidapi.com";
const TIMEOUT_MS = Number(process.env.JUDGE0_TIMEOUT_MS || 12000);

const RAPIDAPI_KEY = process.env.JUDGE0_RAPIDAPI_KEY || process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST =
  process.env.JUDGE0_RAPIDAPI_HOST ||
  "judge0-ce.p.rapidapi.com";

if (!RAPIDAPI_KEY) {
}

const http = axios.create({
  baseURL: BASE_URL.replace(/\/$/, ""),
  timeout: TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.request.use((config) => {
  const key = RAPIDAPI_KEY || requireEnv("JUDGE0_RAPIDAPI_KEY");
  config.headers["X-RapidAPI-Key"] = key;
  config.headers["X-RapidAPI-Host"] = RAPIDAPI_HOST;
  return config;
});

function normalizeAxiosError(err) {
  const status = err?.response?.status;
  const data = err?.response?.data;
  const message = data?.message || err?.message || "Request failed";

  const e = new Error(message);
  e.status = status;
  e.data = data;
  e.isAxiosError = !!err?.isAxiosError;
  return e;
}

/**
 * Create submission (optionally wait for result)
 * @param {object} args
 * @param {number} args.language_id
 * @param {string} args.source_code
 * @param {string} [args.stdin]
 * @param {string} [args.expected_output]
 * @param {number} [args.cpu_time_limit]   (seconds)
 * @param {number} [args.wall_time_limit]  (seconds)
 * @param {number} [args.memory_limit]     (KB, depends on your Judge0 plan; RapidAPI might ignore)
 * @param {boolean} [args.wait]            default true
 * @param {boolean} [args.base64_encoded]  default false
 * @param {string} [args.fields]           e.g. "stdout,stderr,compile_output,time,memory,status"
 */
async function createSubmission(args) {
  try {
    const {
      wait = true,
      base64_encoded = false,
      fields,
      ...payload
    } = args || {};

    if (!payload?.language_id) {
      throw new Error("language_id is required");
    }
    if (payload?.source_code == null || payload?.source_code === "") {
      throw new Error("source_code is required");
    }

    const params = {
      wait: String(!!wait),
      base64_encoded: String(!!base64_encoded),
    };
    if (fields) params.fields = fields;

    const res = await http.post("/submissions", payload, { params });
    return res.data;
  } catch (err) {
    throw normalizeAxiosError(err);
  }
}

/**
 * Get submission result by token (if you create without wait)
 * @param {string} token
 * @param {object} [opts]
 * @param {boolean} [opts.base64_encoded=false]
 * @param {string} [opts.fields]
 */
async function getSubmission(token, opts = {}) {
  try {
    if (!token) throw new Error("token is required");

    const params = {
      base64_encoded: String(!!opts.base64_encoded),
    };
    if (opts.fields) params.fields = opts.fields;

    const res = await http.get(`/submissions/${encodeURIComponent(token)}`, {
      params,
    });
    return res.data;
  } catch (err) {
    throw normalizeAxiosError(err);
  }
}

/**
 * Poll submission until finished (when wait=false)
 * @param {string} token
 * @param {object} [opts]
 * @param {number} [opts.intervalMs=800]
 * @param {number} [opts.timeoutMs=15000]
 * @param {string} [opts.fields]
 * @returns {Promise<object>}
 */
async function pollSubmission(token, opts = {}) {
  const intervalMs = Number(opts.intervalMs || 800);
  const timeoutMs = Number(opts.timeoutMs || 15000);
  const start = Date.now();


  while (true) {
    const data = await getSubmission(token, {
      base64_encoded: false,
      fields: opts.fields,
    });

    const statusId = data?.status?.id;
    const done = statusId != null && Number(statusId) >= 3;
    if (done) return data;

    if (Date.now() - start > timeoutMs) {
      const e = new Error("Judge0 polling timeout");
      e.status = 408;
      e.data = data;
      throw e;
    }

    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

module.exports = {
  createSubmission,
  getSubmission,
  pollSubmission,
};