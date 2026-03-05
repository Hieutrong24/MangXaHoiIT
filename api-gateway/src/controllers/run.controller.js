const { createSubmission } = require("../clients/judge0.client");

const LANGUAGE_MAP = {
  cpp: 54,
  c: 50,
  java: 62,
  python: 71,
  javascript: 63,
  csharp: 51,
  go: 60,
};

function toJudge0LanguageId(languageId) {
  if (languageId == null) return null;

  // Nếu client gửi thẳng số Judge0 language_id
  if (typeof languageId === "number") return languageId;
  const asNumber = Number(languageId);
  if (!Number.isNaN(asNumber) && asNumber > 0) return asNumber;

  // Nếu client gửi dạng key: "python", "cpp", ...
  const key = String(languageId).toLowerCase().trim();
  return LANGUAGE_MAP[key] ?? null;
}

exports.runCode = async (req, res) => {
  try {
    const { languageId, sourceCode, stdin, input } = req.body;

    if (!languageId || !sourceCode) {
      return res
        .status(400)
        .json({ error: "languageId và sourceCode là bắt buộc" });
    }

    const judgeLangId = toJudge0LanguageId(languageId);
    if (!judgeLangId) {
      return res
        .status(400)
        .json({ error: `Ngôn ngữ không hỗ trợ: ${languageId}` });
    }

    const out = await createSubmission({
      language_id: judgeLangId,
      source_code: sourceCode,
      stdin: (stdin ?? input ?? "").toString(),
      wait: true,
    });

    return res.json({
      // ✅ format thân thiện cho UI bạn đang dùng
      status: out?.status?.description || "Unknown",
      verdict: out?.status?.description || "Unknown",

      stdout: out?.stdout ?? "",
      stderr: out?.stderr ?? "",
      compileOutput: out?.compile_output ?? "",

      // Judge0 trả time (string) và memory (KB). UI bạn đang dùng timeMs/memoryKb
      timeMs: out?.time != null ? Number(out.time) * 1000 : null, // nếu out.time là giây (thường là "0.01")
      memoryKb: out?.memory != null ? Number(out.memory) : null,

      exitCode: out?.exit_code ?? null,

      // Giữ thêm raw nếu cần debug
      raw: process.env.NODE_ENV === "development" ? out : undefined,
    });
  } catch (err) {
  const status = err?.status || err?.response?.status;
  const detail = err?.response?.data ?? err?.data;

  console.log("[JUDGE0 FAIL]", {
    status,
    message: err?.message,
    detail,
  });

  return res.status(502).json({
    error: "Judge0 run failed",
    upstreamStatus: status,
    message: detail?.message || err?.message,
    detail,
  });

  }
};