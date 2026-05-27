function validateRunRequest(body) {
  if (!body) return "body required";
  const languageName = body.languageName ?? body.LanguageName;
  const sourceCode = body.sourceCode ?? body.SourceCode;
  const timeLimitMs = body.timeLimitMs ?? body.TimeLimitMs;
  const memoryLimitMb = body.memoryLimitMb ?? body.MemoryLimitMb;
  const tests = body.tests ?? body.Tests;

  if (!languageName || typeof languageName !== "string") return "languageName required";
  if (!sourceCode || typeof sourceCode !== "string") return "sourceCode required";
  if (!Number.isInteger(timeLimitMs) || timeLimitMs <= 0) return "timeLimitMs invalid";
  if (!Number.isInteger(memoryLimitMb) || memoryLimitMb <= 0) return "memoryLimitMb invalid";
  if (!Array.isArray(tests) || tests.length === 0) return "tests required";

  for (const t of tests) {
    const index = t.index ?? t.Index;
    const input = t.input ?? t.Input;
    const expectedOutput = t.expectedOutput ?? t.ExpectedOutput;
    if (!Number.isInteger(index) || index <= 0) return "test.index invalid";
    if (typeof input !== "string") return "test.input invalid";
    if (typeof expectedOutput !== "string") return "test.expectedOutput invalid";
  }
  return null;
}

module.exports = { validateRunRequest };
