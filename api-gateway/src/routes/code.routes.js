const express = require("express");
const { codeController } = require("../controllers/code.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

const router = express.Router();
router.use(authMiddleware());

router.post("/run", codeController.run);
router.get("/languages", codeController.listLanguages);

router.get("/learn/dashboard", codeController.getLearnDashboard);
router.get("/learn/paths", codeController.listLearningPaths);
router.get("/learn/paths/:slug", codeController.getLearningPath);
router.get("/learn/lessons/:lessonId", codeController.getLesson);
router.post("/learn/lessons/:lessonId/complete", codeController.completeLesson);
router.get("/quizzes/:quizId", codeController.getQuiz);
router.post("/quizzes/:quizId/attempts", codeController.submitQuizAttempt);

router.get("/problems/oj", codeController.listProblemsOj);
router.get("/problems/featured", codeController.listFeaturedProblems);
router.get("/problems/:id/overview", codeController.getProblemOverview);
router.get("/problems", codeController.listProblems);
router.get("/problems/:id", codeController.getProblemById);
router.get("/testcases/by-problem/:problemId", codeController.listTestCasesByProblem);
router.post("/submissions", codeController.createSubmission);
router.get("/submissions/:id/result", codeController.getSubmissionResult);
router.get("/submissions/:id", codeController.getSubmissionById);

module.exports = { codeRoutes: router };
