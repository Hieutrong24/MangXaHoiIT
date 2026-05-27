module.exports = function c() {
  const executable = process.platform === "win32" ? "main.exe" : "./main";

  return {
    sourceFile: "main.c",
    compile: {
      cmd: "gcc",
      args: ["-O2", "-std=c17", "main.c", "-o", "main"]
    },
    run: { cmd: executable, args: [] },
    compileTimeoutMs: 30000
  };
};
