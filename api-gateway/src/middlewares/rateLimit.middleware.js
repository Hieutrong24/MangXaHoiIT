// src/middlewares/rateLimit.middleware.js
const rateLimit = require("express-rate-limit");

function createRateLimiter({
  windowMs = 60 * 1000,
  max = 120,
  message = "Too many requests, please try again later.",
} = {}) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message,
        correlationId: req.correlationId,
      });
    },
  });
}

module.exports = { createRateLimiter };
