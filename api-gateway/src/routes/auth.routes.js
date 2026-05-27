// src/routes/auth.routes.js
const express = require("express");
const { authController } = require("../controllers/auth.controller");
const { createRateLimiter } = require("../middlewares/rateLimit.middleware");

const router = express.Router();


const authLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 20 });

router.get("/google", authLimiter, authController.googleLogin);
router.get("/google/callback", authLimiter, authController.googleCallback);
router.post("/login", authLimiter, authController.login);
router.post("/register", authLimiter, authController.register);
router.post("/refresh", authLimiter, authController.refresh);
router.post("/logout", authController.logout);

module.exports = { authRoutes: router };
