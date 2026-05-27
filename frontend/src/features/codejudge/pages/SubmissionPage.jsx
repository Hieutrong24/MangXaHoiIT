import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import GlassCard from "../../../shared/components/GlassCard";
import Button from "../../../shared/components/Button";
import { codejudgeApi } from "../api/codejudge.api";
import CodeEditor from "../components/CodeEditor";
import VerdictBadge, { normalizeVerdict } from "../components/VerdictBadge";
import SubmissionResultPanel from "../components/SubmissionResultPanel";

const templates = {
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

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
  { label: "C++", key: "cpp", internalId: null, judge0Id: 54 },
  { label: "Java", key: "java", internalId: null, judge0Id: 62 },
  { label: "Python", key: "python", internalId: null, judge0Id: 71 },
  { label: "JavaScript", key: "javascript", internalId: null, judge0Id: 63 },
  { label: "C#", key: "csharp", internalId: null, judge0Id: 51 },
  { label: "C", key: "c", internalId: null, judge0Id: 50 },
  { label: "Go", key: "go", internalId: null, judge0Id: 60 },
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
  const fallback = FALLBACK_LANGS.find((item) => item.key === key);
  return {
    label,
    key,
    internalId: dto?.languageId ?? dto?.id ?? fallback?.internalId ?? null,
    judge0Id: dto?.judge0LanguageId ?? dto?.judge0Id ?? dto?.judge0_id ?? fallback?.judge0Id ?? null,
  };
}

function statusTextFromJudge0(result) {
  if (result?.status?.description) return result.status.description;
  if (typeof result?.status === "string") return result.status;
  return normalizeVerdict(result?.verdict || result?.status || "OK");
}

export default function SubmissionPage() {
  const { id: problemId } = useParams();
  const [searchParams] = useSearchParams();

  const [problemOverview, setProblemOverview] = useState(null);
  const [langs, setLangs] = useState(FALLBACK_LANGS);
  const [langKey, setLangKey] = useState("cpp");
  const [code, setCode] = useState(templates.cpp);
  const [customInput, setCustomInput] = useState("");
  const [runResult, setRunResult] = useState(null);
  const [runLoading, setRunLoading] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const mountedRef = useRef(true);
  const nextProblemId = searchParams.get("nextProblemId");
  const pathSlug = searchParams.get("pathSlug");
  const lessonId = searchParams.get("lessonId");
  const lessonItemId = searchParams.get("lessonItemId");
  const autoNext = searchParams.get("autoNext") === "1";

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [langRes, overviewRes] = await Promise.all([
          codejudgeApi.listLanguages(),
          codejudgeApi.getProblemOverview(problemId),
        ]);
        const rawLangs = Array.isArray(langRes) ? langRes : langRes?.items || [];
        const mapped = rawLangs.length ? rawLangs.map(mapBackendLanguageDto) : FALLBACK_LANGS;
        const uniqueMap = new Map();
        [...FALLBACK_LANGS, ...mapped].forEach((item) => {
          const prev = uniqueMap.get(item.key) || {};
          uniqueMap.set(item.key, {
            ...prev,
            ...item,
            internalId: item.internalId ?? prev.internalId ?? null,
            judge0Id: item.judge0Id ?? prev.judge0Id ?? null,
          });
        });

        if (!mountedRef.current) return;
        setLangs(Array.from(uniqueMap.values()));
        setProblemOverview(overviewRes || null);
      } catch (error) {
        console.error("Load submission page data failed", error);
      }
    })();
  }, [problemId]);

  const selectedLang = useMemo(() => langs.find((item) => item.key === langKey) || FALLBACK_LANGS[0], [langs, langKey]);
  const submitVerdict = normalizeVerdict(submitResult?.verdict || submitResult?.status || "");
  const nextProblemHref = useMemo(() => {
    if (!nextProblemId) return null;
    const params = new URLSearchParams();
    if (pathSlug) params.set("pathSlug", pathSlug);
    if (lessonId) params.set("lessonId", lessonId);
    if (autoNext) params.set("autoNext", "1");
    return `/code/problems/${nextProblemId}${params.toString() ? `?${params.toString()}` : ""}`;
  }, [nextProblemId, pathSlug, lessonId, autoNext]);

  const fallbackHref = useMemo(() => {
    const params = new URLSearchParams({ refresh: "1" });
    if (pathSlug) params.set("pathSlug", pathSlug);
    if (lessonId) params.set("lessonId", lessonId);
    return `/code/learn?${params.toString()}`;
  }, [pathSlug, lessonId]);

  const buttonHref = nextProblemHref || fallbackHref;
  const buttonText = "Chinh phục thử thách tiếp theo";

  const handleLanguageChange = (e) => {
    const nextKey = e.target.value;
    setLangKey(nextKey);
    setCode(templates[nextKey] ?? "");
    setRunResult(null);
    setSubmitResult(null);
  };

  const handleRun = async () => {
    if (!selectedLang?.judge0Id) {
      setRunResult({ status: { description: "ERROR" }, stderr: "Không xác định được Judge0 languageId.", stdout: "" });
      return;
    }

    try {
      setRunLoading(true);
      setRunResult(null);
      const result = await codejudgeApi.run({
        languageId: selectedLang.judge0Id,
        sourceCode: code,
        stdin: customInput,
        cpuTimeLimit: 2,
        memoryLimit: 128000,
      });
      setRunResult(result);
    } catch (error) {
      setRunResult({
        status: { description: "ERROR" },
        stderr: error?.response?.data?.message || error?.message || "Run failed",
        stdout: "",
      });
    } finally {
      setRunLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedLang?.internalId) {
      setSubmitResult({ verdict: "ERROR", compileLog: "Không xác định được languageId nội bộ cho backend." });
      return;
    }

    try {
      setSubmitLoading(true);
      setSubmitResult(null);

      const sub = await codejudgeApi.submit({
        problemId,
        languageId: selectedLang.internalId,
        sourceCode: code,
        lessonItemId, // Optional for backend if implemented
      });
      const submissionId = sub?.submissionId || sub?.id;
      if (!submissionId) throw new Error("Không lấy được submissionId");

await codejudgeApi.pollSubmission(submissionId, 2000, 120000);
      const result = await codejudgeApi.getSubmissionResult(submissionId);
      setSubmitResult(result);
    } catch (error) {
      setSubmitResult({
        verdict: "ERROR",
        compileLog: error?.response?.data?.message || error?.message || "Submit failed",
        tests: [],
      });
    } finally {
      setSubmitLoading(false);
    }
  };


  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-4">
        <GlassCard className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold uppercase tracking-wide text-cyan-300">{problemOverview?.problemCode || problemId}</div>
              <div className="mt-1 text-2xl font-black tracking-tight text-slate-100">Nộp bài: {problemOverview?.title || problemId}</div>
              <div className="mt-2 text-sm text-slate-400">Chạy thử bằng Judge0 với input tự nhập. Nộp bài sẽ chấm toàn bộ testcase của hệ thống và hiển thị bảng testcase chi tiết.</div>
            </div>
            <div className="text-right text-xs text-slate-400">
              <div>Ngôn ngữ: <span className="font-semibold text-slate-100">{selectedLang?.label || langKey}</span></div>
              <div className="mt-1">Internal ID: {selectedLang?.internalId ?? "-"} · Judge0 ID: {selectedLang?.judge0Id ?? "-"}</div>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            <div>
              <div className="mb-2 text-xs uppercase tracking-wide text-slate-400">Ngôn ngữ</div>
              <select
                value={langKey}
                onChange={handleLanguageChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2.5 text-sm text-slate-100 shadow-inner shadow-black/20 outline-none transition focus:border-cyan-400/60 focus:bg-slate-900"
              >
                {langs.map((lang) => (
                  <option key={lang.key} value={lang.key} className="bg-slate-900 text-slate-100">
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="mb-2 text-xs uppercase tracking-wide text-slate-400">Code</div>
              <CodeEditor value={code} onChange={setCode} language={langKey} />
            </div>

            <div>
              <div className="mb-2 text-xs uppercase tracking-wide text-slate-400">Custom Input (chạy thử)</div>
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Nhập input để chạy thử..."
                className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-mono text-slate-100 outline-none"
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

            {runResult ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-bold text-slate-200">Kết quả chạy thử</div>
                  <VerdictBadge verdict={statusTextFromJudge0(runResult)} />
                </div>

                <div className="mt-3 grid gap-3">
                  {runResult.compileOutput ? (
                    <div>
                      <div className="mb-1 text-xs uppercase tracking-wide text-amber-300">Compile output</div>
                      <pre className="overflow-auto whitespace-pre-wrap rounded-xl bg-black/40 p-3 text-sm text-amber-100">{runResult.compileOutput}</pre>
                    </div>
                  ) : null}

                  {runResult.stderr ? (
                    <div>
                      <div className="mb-1 text-xs uppercase tracking-wide text-red-300">Stderr</div>
                      <pre className="overflow-auto whitespace-pre-wrap rounded-xl bg-black/40 p-3 text-sm text-red-100">{runResult.stderr}</pre>
                    </div>
                  ) : null}

                  <div>
                    <div className="mb-1 text-xs uppercase tracking-wide text-slate-400">Stdout</div>
                    <pre className="overflow-auto whitespace-pre-wrap rounded-xl bg-black/40 p-3 text-sm text-slate-100">{runResult.stdout ?? ""}</pre>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </GlassCard>

        {submitResult ? (
          <div className="space-y-3">
            <SubmissionResultPanel result={submitResult} />
            {submitVerdict === "AC" ? (
              <div className="flex justify-end">
                <Link to={buttonHref}>
                  <Button>{buttonText}</Button>
                </Link>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="space-y-4">
        <GlassCard className="p-5">
          <div className="mb-4 text-lg font-bold text-slate-100">Thông tin chấm</div>
          <div className="space-y-3 text-sm text-slate-300">
            <InfoRow label="Điểm tối đa" value={problemOverview?.maxScore ?? 100} />
            <InfoRow label="Tổng testcase" value={problemOverview?.testCaseCount ?? 0} />
            <InfoRow label="Tỷ lệ AC" value={`${problemOverview?.acceptanceRate ?? 0}%`} />
            <InfoRow label="Tỷ lệ partial" value={`${problemOverview?.partialRate ?? 0}%`} />
            <InfoRow label="Tỷ lệ sai" value={`${problemOverview?.failedRate ?? 0}%`} />
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="text-slate-400">{label}</div>
      <div className="font-semibold text-slate-100">{value}</div>
    </div>
  );
}
