const router = require("express").Router();
const { run } = require("../controllers/run.controller");

router.post("/run", run);

module.exports = router;
