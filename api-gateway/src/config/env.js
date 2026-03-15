// src/config/env.js
require("dotenv").config();

function getEnv(name, defaultValue = undefined) {
  const val = process.env[name];
  if (val === undefined || val === "") return defaultValue;
  return val;
}

function must(name) {
  const val = getEnv(name);
  if (val === undefined) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return val;
}

function toNumber(value, defaultValue) {
  const n = Number(value);
  return Number.isFinite(n) ? n : defaultValue;
}

function toBool(value, defaultValue = false) {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  const s = String(value).trim().toLowerCase();

  if (["true", "1", "yes", "y", "on"].includes(s)) return true;
  if (["false", "0", "no", "n", "off"].includes(s)) return false;

  return defaultValue;
}

const env = {
  NODE_ENV: getEnv("NODE_ENV", "development"),
  PORT: toNumber(getEnv("PORT", "3000"), 3000),

  // Gateway CORS
  CORS_ORIGIN: getEnv("CORS_ORIGIN", "*"),

  // JWT
  JWT_SECRET: must("JWT_SECRET"),
  JWT_ISSUER: getEnv("JWT_ISSUER", "it-social-platform"),
  JWT_AUDIENCE: getEnv("JWT_AUDIENCE", "it-social-client"),

  // HTTP client defaults
  HTTP_TIMEOUT_MS: toNumber(getEnv("HTTP_TIMEOUT_MS", "8000"), 8000),

  // Upstream services
  AUTH_SERVICE_URL: must("AUTH_SERVICE_URL"),
  USER_SERVICE_URL: must("USER_SERVICE_URL"),
  CODEJUDGE_SERVICE_URL: must("CODEJUDGE_SERVICE_URL"),
  CONTENT_SERVICE_URL: must("CONTENT_SERVICE_URL"),
  CHAT_SERVICE_URL: getEnv("CHAT_SERVICE_URL", "http://localhost:4000"),
  AI_SERVICE_URL: getEnv("AI_SERVICE_URL", "http://localhost:5005"),

  // Judge0 / external feeds
  JUDGE0_BASE_URL: getEnv("JUDGE0_BASE_URL", "https://ce.judge0.com"),
  VIETNAMWORKS_RSS: getEnv("VIETNAMWORKS_RSS", ""),
  CAREERBUILDER_RSS: getEnv("CAREERBUILDER_RSS", ""),
  TOPCV_RSS: getEnv("TOPCV_RSS", ""),

  // Upload / proxy limits for gateway
  UPLOAD_MAX_FILE_SIZE_MB: toNumber(getEnv("UPLOAD_MAX_FILE_SIZE_MB", "30"), 30),
  UPLOAD_REQUIRE_AUTH: toBool(getEnv("UPLOAD_REQUIRE_AUTH", "true"), true),
};

module.exports = { env };