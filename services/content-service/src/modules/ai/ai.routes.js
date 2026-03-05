// src/modules/ai/ai.routes.js
const express = require("express");
const router = express.Router();
const aiController = require("./ai.controller");

router.post("/suggestion", aiController.getSuggestion);

module.exports = router;