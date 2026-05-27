const fs = require("fs/promises");
const path = require("path");
const os = require("os");
const { runOne } = require("../runners/process.runner");
const { getLanguageSpec } = require("../languages/specs");
const { normalize, equals } = require("../utils/output.util");

async function judgeAll(req) {
  const languageName = req.languageName ?? req.LanguageName;
  const sourceCode = req.sourceCode ?? req.SourceCode;
  const timeLimitMs = req.timeLimitMs ?? req.TimeLimitMs ?? 2000;
  const memoryLimitMb = req.memoryLimitMb ?? req.MemoryLimitMb ?? 128;
  const tests = req.tests ?? req.Tests;
  const spec = getLanguageSpec(languageName);

  const workDir = await fs.mkdtemp(path.join(os.tmpdir(), "judge-"));
  let compileLog = "";

  try {
    const srcPath = path.join(workDir, spec.sourceFile);
    await fs.mkdir(path.dirname(srcPath), { recursive: true });
    await fs.writeFile(srcPath, sourceCode, "utf8");

    if (spec.extraFiles) {
      for (const [relativePath, content] of Object.entries(spec.extraFiles)) {
        const extraPath = path.join(workDir, relativePath);
        await fs.mkdir(path.dirname(extraPath), { recursive: true });
        await fs.writeFile(extraPath, content, "utf8");
      }
    }

    if (spec.compile) {
      const c = await runOne({
        cwd: workDir,
        cmd: spec.compile.cmd,
        args: spec.compile.args,
        stdin: "",
        timeoutMs: spec.compileTimeoutMs ?? Math.max(15000, timeLimitMs * 2),
        memLimitMb: spec.compileMemLimitMb ?? Math.max(256, memoryLimitMb)
      });

      compileLog = (c.stdout || "") + (c.stderr || "");
      if (c.exitCode !== 0 || c.timedOut) {
        return {
          verdict: "CE",
          compileLog,
          totalTimeMs: c.timeMs || 0,
          peakMemoryKb: 0,
          tests: tests.map((t) => ({
            index: t.index ?? t.Index,
            verdict: "CE",
            timeMs: 0,
            memoryKb: 0
          }))
        };
      }
    }

    const results = [];
    let totalTime = 0;
    let peakMem = 0;

    for (const rawTest of tests) {
      const t = {
        index: rawTest.index ?? rawTest.Index,
        input: rawTest.input ?? rawTest.Input ?? "",
        expectedOutput: rawTest.expectedOutput ?? rawTest.ExpectedOutput ?? ""
      };

      const r = await runOne({
        cwd: workDir,
        cmd: spec.run.cmd,
        args: spec.run.args,
        stdin: t.input,
        timeoutMs: timeLimitMs,
        memLimitMb: memoryLimitMb
      });

      totalTime += r.timeMs;
      peakMem = Math.max(peakMem, r.memoryKb || 0);

      if (r.timedOut) {
        results.push({
          index: t.index,
          verdict: "TLE",
          timeMs: r.timeMs,
          memoryKb: 0,
          stdout: r.stdout,
          stderr: r.stderr
        });
        continue;
      }

      if (r.exitCode !== 0) {
        results.push({
          index: t.index,
          verdict: "RE",
          timeMs: r.timeMs,
          memoryKb: 0,
          stdout: r.stdout,
          stderr: r.stderr
        });
        continue;
      }

      const ok = equals(normalize(r.stdout || ""), normalize(t.expectedOutput || ""));
      results.push({
        index: t.index,
        verdict: ok ? "AC" : "WA",
        timeMs: r.timeMs,
        memoryKb: 0,
        stdout: r.stdout,
        stderr: r.stderr
      });
    }

    const finalVerdict = results.find((r) => r.verdict !== "AC")?.verdict || "AC";

    return {
      verdict: finalVerdict,
      compileLog,
      totalTimeMs: totalTime,
      peakMemoryKb: peakMem,
      tests: results
    };
  } finally {
    try {
      await fs.rm(workDir, { recursive: true, force: true });
    } catch (e) {}
  }
}

module.exports = { judgeAll };
