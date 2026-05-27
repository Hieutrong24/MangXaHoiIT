const { spawn } = require("child_process");

function runOne({ cwd, cmd, args = [], stdin = '', timeoutMs = 5000, memLimitMb = 128 }) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const p = spawn(cmd, args, { cwd, stdio: ['pipe', 'pipe', 'pipe'], maxBuffer: memLimitMb * 1024 * 1024 });

    let stdout = '';
    let stderr = '';
    let timedOut = false;
    let killed = false;

    const timer = setTimeout(() => {
      timedOut = true;
      killed = true;
      p.kill('SIGKILL');
      p.kill('SIGTERM'); // Fallback
    }, timeoutMs);

    p.stdout.on('data', d => stdout += d.toString());
    p.stderr.on('data', d => stderr += d.toString());

    p.on('error', err => {
      clearTimeout(timer);
      resolve({
        exitCode: -1,
        stdout,
        stderr: stderr || String(err),
        timedOut: !killed,
        timeMs: Date.now() - start,
        memoryKb: 0
      });
    });

    p.on('close', code => {
      clearTimeout(timer);
      resolve({
        exitCode: code ?? -1,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        timedOut,
        timeMs: Math.min(Date.now() - start, timeoutMs),
        memoryKb: 0
      });
    });

    // FIX STDIN PIPE
    if (stdin) {
      p.stdin.write(stdin);
      p.stdin.write('\n');
    }
    p.stdin.end();
  });
}

module.exports = { runOne };

