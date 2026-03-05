// src/routes/code.routes.js
const express = require("express");
const { codeController } = require("../controllers/code.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { runCode } = require("../controllers/run.controller");

const router = express.Router();
// router.post("/run", runCode);
router.use(authMiddleware());
router.post("/run", codeController.run);
// Proxy sang code-judge-service
router.get("/problems", codeController.listProblems);
router.get("/problems/:id", codeController.getProblemById);
router.post("/submissions", codeController.createSubmission);
router.get("/submissions/:id", codeController.getSubmissionById);
 router.get("/languages", codeController.listLanguages);
module.exports = { codeRoutes: router };
