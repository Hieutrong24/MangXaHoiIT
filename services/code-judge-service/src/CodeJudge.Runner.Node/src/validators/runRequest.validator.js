function validateRunRequest(body) {
  if (!body) return "body required";
  const { languageName, sourceCode, timeLimitMs, memoryLimitMb, tests } = body;

  if (!languageName || typeof languageName !== "string") return "languageName required";
  if (!sourceCode || typeof sourceCode !== "string") return "sourceCode required";
  if (!Number.isInteger(timeLimitMs) || timeLimitMs <= 0) return "timeLimitMs invalid";
  if (!Number.isInteger(memoryLimitMb) || memoryLimitMb <= 0) return "memoryLimitMb invalid";
  if (!Array.isArray(tests) || tests.length === 0) return "tests required";

  for (const t of tests) {
    if (!Number.isInteger(t.index) || t.index <= 0) return "test.index invalid";
    if (typeof t.input !== "string") return "test.input invalid";
    if (typeof t.expectedOutput !== "string") return "test.expectedOutput invalid";
  }
  return null;
}

module.exports = { validateRunRequest };
