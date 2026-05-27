const express = require("express");
const { aiController } = require("../controllers/ai.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(authMiddleware());

router.post("/suggestion", aiController.getSuggestion);

module.exports = { aiRoutes: router };