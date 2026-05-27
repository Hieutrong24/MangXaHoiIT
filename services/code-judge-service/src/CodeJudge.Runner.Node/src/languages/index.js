const javascript = require("./javascript");
const python = require("./python");
const cpp = require("./cpp");
const c = require("./c");
const java = require("./java");
const go = require("./go");
const csharp = require("./csharp");

function normalizeLanguageKey(name) {
  const key = String(name || "").toLowerCase().trim();

  if (key.includes("javascript") || key.includes("node")) return "javascript";
  if (key.includes("python")) return "python";
  if (key === "c" || key === "gnu c" || key.includes("c17") || key.includes("gcc")) return "c";
  if (key.includes("c++") || key === "cpp" || key.includes("clang++") || key.includes("g++")) return "cpp";
  if (key.includes("java") && !key.includes("javascript")) return "java";
  if (key === "go" || key.includes("golang")) return "go";
  if (key.includes("c#") || key.includes("csharp") || key.includes("dotnet")) return "csharp";

  return key;
}

function getLanguageSpec(name) {
  switch (normalizeLanguageKey(name)) {
    case "javascript":
      return javascript();
    case "python":
      return python();
    case "cpp":
      return cpp();
    case "c":
      return c();
    case "java":
      return java();
    case "go":
      return go();
    case "csharp":
      return csharp();
    default:
      throw new Error(`Unsupported language: ${name}`);
  }
}

module.exports = { getLanguageSpec, normalizeLanguageKey };
