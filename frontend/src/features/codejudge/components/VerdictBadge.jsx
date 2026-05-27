const LABEL_MAP = {
  1: "QUEUED",
  2: "RUNNING",
  3: "AC",
  4: "WA",
  5: "TLE",
  6: "MLE",
  7: "RE",
  8: "CE",
};

export function normalizeVerdict(verdict) {
  if (verdict == null) return "UNKNOWN";
  if (typeof verdict === "number") return LABEL_MAP[verdict] || `#${verdict}`;
  const raw = String(verdict).trim();
  if (/^\d+$/.test(raw)) return LABEL_MAP[Number(raw)] || raw;
  return raw.toUpperCase();
}

export default function VerdictBadge({ verdict }) {
  const value = normalizeVerdict(verdict);
  const map = {
    AC: "bg-emerald-500/15 text-emerald-200 border-emerald-500/20",
    WA: "bg-red-500/15 text-red-200 border-red-500/20",
    TLE: "bg-orange-500/15 text-orange-200 border-orange-500/20",
    MLE: "bg-amber-500/15 text-amber-200 border-amber-500/20",
    RE: "bg-fuchsia-500/15 text-fuchsia-200 border-fuchsia-500/20",
    CE: "bg-sky-500/15 text-sky-200 border-sky-500/20",
    QUEUED: "bg-white/5 text-slate-200 border-white/10",
    RUNNING: "bg-cyan-500/15 text-cyan-200 border-cyan-500/20",
    PARTIAL: "bg-yellow-500/15 text-yellow-200 border-yellow-500/20",
    ERROR: "bg-red-500/15 text-red-200 border-red-500/20",
    DONE: "bg-emerald-500/15 text-emerald-200 border-emerald-500/20",
    UNKNOWN: "bg-white/5 text-slate-200 border-white/10",
  };

  const cls = map[value] || "bg-white/5 text-slate-200 border-white/10";

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${cls}`}>
      {value}
    </span>
  );
}
