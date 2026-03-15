const path = require("path");

function getLanguageSpec(name) {
  const key = String(name || "").toLowerCase();

  if (key === "javascript") {
    return { sourceFile: "main.js", compile: null, run: { cmd: "node", args: ["main.js"] } };
  }
  if (key === "python") {
    return { sourceFile: "main.py", compile: null, run: { cmd: "python3", args: ["main.py"] } };
  }
  if (key === "cpp") {
    return {
      sourceFile: "main.cpp",
      compile: { cmd: "g++", args: ["-O2", "-std=c++17", "main.cpp", "-o", "main.out"] },
      run: { cmd: path.join(".", "main.out"), args: [] }
    };
  }

  // csharp: Ä‘á»ƒ "Äƒn ngay" báº¡n cĂ³ thá»ƒ táº¡m disable á»Ÿ DB hoáº·c implement sau
  if (key === "csharp") {
    throw new Error("csharp runner not implemented in this minimal bootstrap");
  }

  throw new Error(`Unsupported language: ${name}`);
}

module.exports = { getLanguageSpec };
