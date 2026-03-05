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

const env = {
  NODE_ENV: getEnv("NODE_ENV", "development"),
  PORT: Number(getEnv("PORT", "3000")),

  // Gateway CORS
  CORS_ORIGIN: getEnv("CORS_ORIGIN", "*"),

  // JWT
  JWT_SECRET: must("JWT_SECRET"), // bắt buộc
  JWT_ISSUER: getEnv("JWT_ISSUER", "it-social-platform"),
  JWT_AUDIENCE: getEnv("JWT_AUDIENCE", "it-social-client"),

  // HTTP client defaults
  HTTP_TIMEOUT_MS: Number(getEnv("HTTP_TIMEOUT_MS", "8000")),

  // Upstream services
  AUTH_SERVICE_URL: must("AUTH_SERVICE_URL"),
  USER_SERVICE_URL: must("USER_SERVICE_URL"),
  CODEJUDGE_SERVICE_URL: must("CODEJUDGE_SERVICE_URL"),
  CONTENT_SERVICE_URL: must("CONTENT_SERVICE_URL"),
  CHAT_SERVICE_URL: process.env.CHAT_SERVICE_URL || "http://localhost:4000",

  // ===== Cloudinary (Uploads) =====
  CLOUDINARY_CLOUD_NAME: must("CLOUDINARY_CLOUD_NAME"),
  CLOUDINARY_API_KEY: must("CLOUDINARY_API_KEY"),
  CLOUDINARY_API_SECRET: must("CLOUDINARY_API_SECRET"),
  CLOUDINARY_FOLDER: getEnv("CLOUDINARY_FOLDER", "it-social/posts"),
};

module.exports = { env };