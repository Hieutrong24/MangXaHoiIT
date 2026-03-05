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

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: toInt(process.env.PORT, 5002),
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/content_service",

  BROKER_DRIVER: (process.env.BROKER_DRIVER || "inmemory").toLowerCase(),
  RABBIT_URL: process.env.RABBIT_URL || "amqp://localhost:5672",
  RABBIT_EXCHANGE: process.env.RABBIT_EXCHANGE || "events",

  
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
};

module.exports = { env };