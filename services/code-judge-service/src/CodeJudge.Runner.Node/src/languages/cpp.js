
module.exports = function cpp() {
  const executable = process.platform === "win32" ? "main.exe" : "./main";

  return {
    sourceFile: "main.cpp",
    compile: {
      cmd: "g++",
      args: ["-O2", "-std=c++17", "main.cpp", "-o", "main"]
    },
    run: { cmd: executable, args: [] },
    compileTimeoutMs: 30000
  };
};
