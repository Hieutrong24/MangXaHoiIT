const { spawn } = require("child_process");

function runOne({ cwd, cmd, args, stdin, timeoutMs }) {
  return new Promise((resolve) => {
    const start = Date.now();
    const p = spawn(cmd, args, { cwd });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      try { p.kill("SIGKILL"); } catch {}
    }, timeoutMs);

    p.stdout.on("data", d => stdout += d.toString());
    p.stderr.on("data", d => stderr += d.toString());

    p.on("close", (code) => {
      clearTimeout(timer);
      resolve({
        exitCode: code ?? -1,
        stdout,
        stderr,
        timedOut,
        timeMs: Date.now() - start,
        memoryKb: 0
      });
    });

    if (stdin && stdin.length > 0) p.stdin.write(stdin);
    p.stdin.end();
  });
}

module.exports = { runOne };
