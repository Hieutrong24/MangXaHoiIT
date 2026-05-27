
module.exports = function python() {
  const pythonBin = process.env.PYTHON_BIN || (process.platform === "win32" ? "python" : "/usr/bin/python3");

  return {
    sourceFile: "main.py",
    compile: null,
    run: { cmd: pythonBin, args: ["-I", "-u", "main.py"] }
  };
};
