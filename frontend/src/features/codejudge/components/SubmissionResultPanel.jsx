import { useEffect, useMemo, useState } from "react";
import VerdictBadge, { normalizeVerdict } from "./VerdictBadge";

function testStatusLabel(status) {
  const raw = Number(status);
  if (raw === 1) return "AC";
  if (raw === 2) return "WA";
  if (raw === 3) return "TLE";
  if (raw === 4) return "MLE";
  if (raw === 5) return "RE";
  if (raw === 6) return "CE";
  return normalizeVerdict(status);
}

export default function SubmissionResultPanel({ result }) {
  if (!result) return null;

  const analytics = result.analytics || null;
  const verdict = result.verdict || result.status || "UNKNOWN";
  const normalizedVerdict = normalizeVerdict(verdict);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 26 }, (_, index) => ({
        id: index,
        left: `${4 + ((index * 3.7) % 92)}%`,
        delay: `${(index % 9) * 0.07}s`,
        duration: `${1.8 + (index % 4) * 0.2}s`,
        rotate: `${(index % 2 === 0 ? 1 : -1) * (14 + index * 6)}deg`,
        color: ["#22c55e", "#06b6d4", "#f59e0b", "#a855f7", "#ef4444", "#3b82f6"][index % 6],
      })),
    []
  );

  useEffect(() => {
    if (normalizedVerdict !== "AC") {
      setShowConfetti(false);
      return undefined;
    }

    setShowConfetti(true);
    const timer = window.setTimeout(() => setShowConfetti(false), 2600);
    return () => window.clearTimeout(timer);
  }, [normalizedVerdict, result?.submissionId]);

  return (
    <div className="grid gap-4">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4">
        {showConfetti ? (
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            {confettiPieces.map((piece) => (
              <span
                key={piece.id}
                className="absolute top-0 h-3 w-2 rounded-full opacity-90 animate-[submission-confetti_var(--submission-confetti-duration)_ease-out_forwards]"
                style={{
                  left: piece.left,
                  background: piece.color,
                  rotate: piece.rotate,
                  animationDelay: piece.delay,
                  ["--submission-confetti-duration"]: piece.duration,
                }}
              />
            ))}
          </div>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-lg font-bold text-slate-100">Kết quả nộp bài</div>
            <div className="mt-1 text-sm text-slate-400">Submission: {result.submissionId}</div>
          </div>
          <VerdictBadge verdict={verdict} />
        </div>

        {analytics ? (
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <SummaryMiniCard label="Điểm" value={`${analytics.earnedScore}/${analytics.maxScore}`} />
            <SummaryMiniCard label="Đúng" value={`${analytics.passedTests}/${analytics.totalTests}`} hint={`${analytics.passedRate}%`} />
            <SummaryMiniCard label="Sai" value={`${analytics.failedTests}`} hint={`${analytics.failedRate}%`} />
            <SummaryMiniCard label="Chưa đúng hoàn toàn" value={analytics.isPartiallyCorrect ? "Có" : "Không"} hint={`${analytics.partialRate}%`} />
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-400">
          <span>Time: {result.totalTimeMs ?? 0} ms</span>
          <span>Peak memory: {result.peakMemoryKB ?? 0} KB</span>
        </div>

        {result.compileLog ? (
          <div className="mt-4">
            <div className="mb-1 text-xs uppercase tracking-wide text-amber-300">Compile log</div>
            <pre className="overflow-auto rounded-xl bg-black/40 p-3 text-sm text-amber-100 whitespace-pre-wrap">{result.compileLog}</pre>
          </div>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/85">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-black/40 text-left text-slate-200">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Kết quả</th>
                <th className="px-4 py-3">Điểm</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Memory</th>
                <th className="px-4 py-3">Loại</th>
                <th className="px-4 py-3">Thông tin</th>
              </tr>
            </thead>
            <tbody>
              {(result.tests || []).length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">Chưa có testcase result.</td>
                </tr>
              ) : (
                (result.tests || []).map((test) => (
                  <tr key={test.testCaseId} className="border-t border-white/5 text-slate-200">
                    <td className="px-4 py-3">{test.orderNo}</td>
                    <td className="px-4 py-3"><VerdictBadge verdict={testStatusLabel(test.status)} /></td>
                    <td className="px-4 py-3">{test.score ?? 0}</td>
                    <td className="px-4 py-3">{test.timeMs} ms</td>
                    <td className="px-4 py-3">{test.memoryKB} KB</td>
                    <td className="px-4 py-3">{test.isSample ? "Sample" : "Hidden"}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      <TestInfoCell test={test} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TestInfoCell({ test }) {
  const chunks = [];
  if (test.errorMessage) chunks.push(`Error: ${test.errorMessage}`);
  if (test.isSample && test.inputPreview) chunks.push(`Input: ${String(test.inputPreview).slice(0, 60)}`);
  if (test.isSample && test.expectedOutputPreview) chunks.push(`Expected: ${String(test.expectedOutputPreview).slice(0, 60)}`);
  if (test.actualOutput) chunks.push(`Actual: ${String(test.actualOutput).slice(0, 60)}`);
  if (chunks.length === 0) return testStatusLabel(test.status);
  return chunks.join(" | ");
}

function SummaryMiniCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-2 text-xl font-black text-slate-100">{value}</div>
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
    </div>
  );
}
