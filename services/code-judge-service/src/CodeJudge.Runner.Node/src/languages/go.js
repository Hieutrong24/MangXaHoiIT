module.exports = function go() {
  const executable = process.platform === "win32" ? "main.exe" : "./main";

  return {
    sourceFile: "main.go",
    compile: {
      cmd: "go",
      args: ["build", "-o", "main", "main.go"]
    },
    run: { cmd: executable, args: [] },
    compileTimeoutMs: 45000
  };
};
