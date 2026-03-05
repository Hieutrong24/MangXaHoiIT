// src/routes/external.routes.js
const router = require("express").Router();
const externalController = require("../controllers/external.controller");

router.get("/it-news", externalController.itNews);
router.get("/it-jobs", externalController.itJobs);

module.exports = router;