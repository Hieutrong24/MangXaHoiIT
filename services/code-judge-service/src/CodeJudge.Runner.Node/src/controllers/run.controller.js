const { validateRunRequest } = require("../validators/runRequest.validator");
const { judgeAll } = require("../services/judge.service");

async function run(req, res) {
  const err = validateRunRequest(req.body);
  if (err) return res.status(400).json({ error: err });

  try {
    const result = await judgeAll(req.body);
    res.json(result);
  } catch (e) {
    res.status(500).json({
      verdict: "RE",
      compileLog: String(e && e.stack ? e.stack : e),
      totalTimeMs: 0,
      peakMemoryKb: 0,
      tests: []
    });
  }
}

module.exports = { run };
