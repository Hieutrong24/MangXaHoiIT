const fs = require("fs/promises");
const path = require("path");
const os = require("os");
const { runOne } = require("../runners/process.runner");
const { getLanguageSpec } = require("../languages");
const { normalize, equals } = require("../utils/output.util");

async function judgeAll(req) {
  const { languageName, sourceCode, timeLimitMs, tests } = req;
  const spec = getLanguageSpec(languageName);

  const workDir = await fs.mkdtemp(path.join(os.tmpdir(), "judge-"));
  let compileLog = null;

  try {
    const srcPath = path.join(workDir, spec.sourceFile);
    await fs.writeFile(srcPath, sourceCode, "utf8");

    // compile if needed
    if (spec.compile) {
      const c = await runOne({ cwd: workDir, cmd: spec.compile.cmd, args: spec.compile.args, stdin: "", timeoutMs: Math.min(15000, timeLimitMs * 2) });
      compileLog = (c.stdout || "") + (c.stderr || "");
      if (c.exitCode !== 0) {
        return {
          verdict: "CE",
          compileLog,
          totalTimeMs: c.timeMs,
          peakMemoryKb: 0,
          tests: tests.map(t => ({ index: t.index, verdict: "CE", timeMs: 0, memoryKb: 0, stdout: null, stderr: null }))
        };
      }
    }

    const results = [];
    let totalTime = 0;
    let peakMem = 0;

    for (const t of tests) {
      const r = await runOne({ cwd: workDir, cmd: spec.run.cmd, args: spec.run.args, stdin: t.input, timeoutMs: timeLimitMs });
      totalTime += r.timeMs;
      peakMem = Math.max(peakMem, r.memoryKb || 0);

      if (r.timedOut) {
        results.push({ index: t.index, verdict: "TLE", timeMs: r.timeMs, memoryKb: 0, stdout: r.stdout, stderr: r.stderr });
        continue;
      }
      if (r.exitCode !== 0) {
        results.push({ index: t.index, verdict: "RE", timeMs: r.timeMs, memoryKb: 0, stdout: r.stdout, stderr: r.stderr });
        continue;
      }

      const ok = equals(normalize(r.stdout || ""), normalize(t.expectedOutput || ""));
      results.push({ index: t.index, verdict: ok ? "AC" : "WA", timeMs: r.timeMs, memoryKb: 0, stdout: r.stdout, stderr: r.stderr });
    }

    const finalVerdict = results.find(x => x.verdict !== "AC")?.verdict || "AC";

    return {
      verdict: finalVerdict,
      compileLog,
      totalTimeMs: totalTime,
      peakMemoryKb: peakMem,
      tests: results
    };
  } finally {
    try { await fs.rm(workDir, { recursive: true, force: true }); } catch {}
  }
}

module.exports = { judgeAll };
