module.exports = function java() {
  return {
    sourceFile: "Main.java",
    compile: {
      cmd: "javac",
      args: ["-encoding", "UTF-8", "Main.java"]
    },
    run: { cmd: "java", args: ["Main"] },
    compileTimeoutMs: 45000
  };
};
