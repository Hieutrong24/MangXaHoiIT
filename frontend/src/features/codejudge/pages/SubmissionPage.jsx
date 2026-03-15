import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import GlassCard from "../../../shared/components/GlassCard";
import Button from "../../../shared/components/Button";
import { codejudgeApi } from "../api/codejudge.api";
import CodeEditor from "../components/CodeEditor";
import VerdictBadge from "../components/VerdictBadge";

const templates = {
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {

  return 0;
}
`,
  c: `#include <stdio.h>

int main() {

  return 0;
}
`,
  java: `import java.util.*;

public class Main {
  public static void main(String[] args) {

  }
}
`,
  python: `def solve():
  pass

if __name__ == "__main__":
  solve()
`,
  javascript: `function solve(input) {
  return input;
}

const fs = require("fs");
const input = fs.readFileSync(0, "utf8");
const out = solve(input);
process.stdout.write(String(out ?? ""));
`,
  csharp: `using System;

class Program {
  static void Main() {

  }
}
`,
  go: `package main

import "fmt"

func main() {

  fmt.Println()
}
`,
};

const FALLBACK_LANGS = [
  { label: "C++", key: "cpp", judge0Id: 54 },
  { label: "C", key: "c", judge0Id: 50 },
  { label: "Java", key: "java", judge0Id: 62 },
  { label: "Python", key: "python", judge0Id: 71 },
  { label: "JavaScript", key: "javascript", judge0Id: 63 },
  { label: "C#", key: "csharp", judge0Id: 51 },
  { label: "Go", key: "go", judge0Id: 60 },
];

function normalizeLanguageKey(raw) {
  const s = String(raw || "").toLowerCase().trim();
  if (s.includes("c++") || s === "cpp" || s.includes("cpp")) return "cpp";
  if (s === "c") return "c";
  if (s.includes("java") && !s.includes("script")) return "java";
  if (s.includes("python")) return "python";
  if (s.includes("javascript") || s.includes("node")) return "javascript";
  if (s.includes("c#") || s.includes("csharp") || s === "cs") return "csharp";
  if (s === "go" || s.includes("golang")) return "go";
  return s;
}

function mapBackendLanguageDto(dto) {
  const label = dto?.label || dto?.name || dto?.title || "Unknown";
  const key = normalizeLanguageKey(dto?.key || dto?.slug || dto?.code || label);
  const judge0Id =
    dto?.judge0LanguageId ??
    dto?.judge0Id ??
    dto?.judge0_id ??
    dto?.judge0_language_id ??
    null;

  return { label, key, judge0Id: typeof judge0Id === "number" ? judge0Id : null };
}

function statusTextFromJudge0(result) {
  if (result?.status?.description) return result.status.description;
  if (typeof result?.status === "string") return result.status;
  if (result?.verdict) return String(result.verdict);
  return "OK";
}

function unwrapGatewayPayload(x) {
  return x?.data ?? x;
}

export default function SubmissionPage() {
  const { id: problemId } = useParams();

  const [langs, setLangs] = useState(FALLBACK_LANGS);
  const [langKey, setLangKey] = useState("cpp");
  const [code, setCode] = useState(templates.cpp);
  const [customInput, setCustomInput] = useState("");

  const [runResult, setRunResult] = useState(null);
  const [runLoading, setRunLoading] = useState(false);

  const [submitResult, setSubmitResult] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => (mountedRef.current = false);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await codejudgeApi.listLanguages();
        const raw = res?.items ?? res?.data ?? res;
        if (!Array.isArray(raw) || raw.length === 0) return;

        const mapped = raw.map(mapBackendLanguageDto);
        const merged = mapped.map((x) => {
          if (x.judge0Id != null) return x;
          const fb = FALLBACK_LANGS.find((f) => f.key === x.key);
          return { ...x, judge0Id: fb?.judge0Id ?? null };
        });

        const mergedKeys = new Set(merged.map((m) => m.key));
        const appended = [...merged, ...FALLBACK_LANGS.filter((f) => !mergedKeys.has(f.key))];

        if (mountedRef.current) setLangs(appended);
      } catch {}
    })();
  }, []);

  const selectedLang = useMemo(() => {
    return (
      langs.find((l) => l.key === langKey) ||
      FALLBACK_LANGS.find((f) => f.key === langKey) ||
      langs[0]
    );
  }, [langs, langKey]);

  const judge0LanguageId = useMemo(() => {
    return (
      FALLBACK_LANGS.find((f) => f.key === langKey)?.judge0Id ??
      selectedLang?.judge0Id ??
      null
    );
  }, [langKey, selectedLang]);

  const handleLanguageChange = (e) => {
    const nextKey = e.target.value;
    setLangKey(nextKey);
    setCode(templates[nextKey] ?? "");
    setRunResult(null);
    setSubmitResult(null);
  };

  const handleResetTemplate = () => {
    setCode(templates[langKey] ?? "");
    setRunResult(null);
    setSubmitResult(null);
  };

  const handleRun = async () => {
    if (!judge0LanguageId) {
      setRunResult({
        status: { description: "ERROR" },
        stderr: "Không xác định được Judge0 languageId.",
        stdout: "",
      });
      return;
    }

    try {
      setRunLoading(true);
      setRunResult(null);

      const res = await codejudgeApi.run({
        languageId: judge0LanguageId,
        sourceCode: code,
        stdin: customInput,
        cpuTimeLimit: 2,
        memoryLimit: 128000,
      });

      const normalized = unwrapGatewayPayload(res);
      setRunResult(normalized);
    } catch (err) {
      setRunResult({
        status: { description: "ERROR" },
        stdout: "",
        stderr:
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          "Run failed",
      });
    } finally {
      setRunLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitLoading(true);
      setSubmitResult(null);

      const payload = {
        problemId,
        languageId: judge0LanguageId ?? langKey,
        sourceCode: code,
      };

      const subRes = await codejudgeApi.submit(payload);
      const sub = unwrapGatewayPayload(subRes);
      const submissionId = sub?.submissionId || sub?.id;

      if (submissionId && typeof codejudgeApi.pollSubmission === "function") {
        const finalRes = await codejudgeApi.pollSubmission(submissionId, 1000, 20000);
        setSubmitResult(unwrapGatewayPayload(finalRes));
      } else {
        setSubmitResult(sub);
      }
    } catch (err) {
      setSubmitResult({
        status: "ERROR",
        message:
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          "Submit failed",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="grid gap-4">
      <GlassCard className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xl font-extrabold tracking-tight">
              Nộp bài: {problemId}
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Chạy thử: chạy với input bạn nhập (Judge0). Nộp bài: chấm full testcase (backend).
            </div>
          </div>

          <div className="text-xs text-slate-400 text-right">
            Ngôn ngữ:{" "}
            <span className="text-slate-200 font-semibold">
              {selectedLang?.label || langKey}
            </span>
            {judge0LanguageId ? (
              <div className="mt-1 text-[11px] text-slate-500">
                Judge0 ID: {judge0LanguageId}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          <div>
            <div className="text-xs text-slate-300 mb-2">Ngôn ngữ</div>
            <select
              value={langKey}
              onChange={handleLanguageChange}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm"
            >
              {langs.map((l) => (
                <option key={l.key} value={l.key}>
                  {l.label}
                </option>
              ))}
            </select>

            <div className="mt-2 text-[11px] text-slate-400">
              Đổi ngôn ngữ sẽ reset code theo template.
              <button
                className="ml-2 underline hover:text-slate-200"
                onClick={handleResetTemplate}
                type="button"
              >
                Reset theo template
              </button>
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-300 mb-2">Code</div>
            <CodeEditor value={code} onChange={setCode} language={langKey} />
          </div>

          <div>
            <div className="text-xs text-slate-300 mb-2">Custom Input (chạy thử)</div>
            <textarea
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Nhập input để chạy thử..."
              className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/15 font-mono"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={handleRun} disabled={runLoading || submitLoading}>
              {runLoading ? "Đang chạy..." : "Chạy thử"}
            </Button>

            <Button onClick={handleSubmit} disabled={submitLoading || runLoading}>
              {submitLoading ? "Đang nộp..." : "Nộp bài"}
            </Button>
          </div>

          {!!runResult && (
            <div className="mt-2 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="font-bold text-slate-200">Kết quả chạy thử</div>
                <VerdictBadge verdict={statusTextFromJudge0(runResult)} />
              </div>

              <div className="mt-3 grid gap-3">
                {!!runResult.compileOutput && (
                  <div>
                    <div className="text-xs text-amber-300 mb-1">COMPILE OUTPUT</div>
                    <pre className="whitespace-pre-wrap rounded-xl bg-black/40 p-3 text-sm text-amber-200 overflow-auto">
                      {runResult.compileOutput}
                    </pre>
                  </div>
                )}

                {!!runResult.stderr && (
                  <div>
                    <div className="text-xs text-red-300 mb-1">STDERR</div>
                    <pre className="whitespace-pre-wrap rounded-xl bg-black/40 p-3 text-sm text-red-200 overflow-auto">
                      {runResult.stderr}
                    </pre>
                  </div>
                )}

                <div>
                  <div className="text-xs text-slate-400 mb-1">STDOUT</div>
                  <pre className="whitespace-pre-wrap rounded-xl bg-black/40 p-3 text-sm text-slate-100 overflow-auto">
                    {runResult.stdout ?? ""}
                  </pre>
                </div>

                <div className="text-xs text-slate-400">
                  {runResult.time != null ? `Time: ${runResult.time}s` : ""}
                  {runResult.memory != null ? ` | Memory: ${runResult.memory} KB` : ""}
                  {runResult.token ? ` | Token: ${runResult.token}` : ""}
                </div>
              </div>
            </div>
          )}

          {!!submitResult && (
            <div className="mt-2 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="font-bold text-slate-200">Kết quả nộp bài</div>
                <VerdictBadge verdict={String(submitResult?.verdict || submitResult?.status || "OK")} />
              </div>

              <div className="mt-2 text-sm text-slate-300">
                {submitResult.message
                  ? submitResult.message
                  : submitResult.verdict
                  ? `Verdict: ${String(submitResult.verdict)}`
                  : "Đã gửi bài thành công."}
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}