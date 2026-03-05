// src/routes/auth.routes.js
const express = require("express");
const { authController } = require("../controllers/auth.controller");
const { createRateLimiter } = require("../middlewares/rateLimit.middleware");

const router = express.Router();

// Rate limit mạnh cho login/refresh (tránh brute-force)
const authLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 20 });

router.post("/login", authLimiter, authController.login);
router.post("/refresh", authLimiter, authController.refresh);
router.post("/logout", authController.logout);

module.exports = { authRoutes: router };
