const path = require("path");
const dotenv = require("dotenv");

// Load đúng .env ở root content-service
dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

function toInt(v, def) {
  const n = parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) ? n : def;
}

function toBool(v, def = false) {
  if (v === undefined || v === null || v === "") return def;
  const s = String(v).trim().toLowerCase();
  if (["true", "1", "yes", "y", "on"].includes(s)) return true;
  if (["false", "0", "no", "n", "off"].includes(s)) return false;
  return def;
}

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: toInt(process.env.PORT, 5002),
  MONGO_URI:
    process.env.MONGO_URI || "mongodb://localhost:27017/content_service",

  BROKER_DRIVER: (process.env.BROKER_DRIVER || "inmemory").toLowerCase(),
  RABBIT_URL: process.env.RABBIT_URL || "amqp://localhost:5672",
  RABBIT_EXCHANGE: process.env.RABBIT_EXCHANGE || "events",

  GEMINI_API_KEY: process.env.GEMINI_API_KEY,

  // ===== Cloudinary =====
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
  CLOUDINARY_FOLDER: process.env.CLOUDINARY_FOLDER || "it-social/posts",

  // ===== Upload =====
  UPLOAD_MAX_FILE_SIZE_MB: toInt(process.env.UPLOAD_MAX_FILE_SIZE_MB, 30),
  UPLOAD_ENABLE_STRICT_MIME_CHECK: toBool(
    process.env.UPLOAD_ENABLE_STRICT_MIME_CHECK,
    false
  ),
};

module.exports = { env };