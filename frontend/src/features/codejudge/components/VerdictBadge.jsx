export default function VerdictBadge({ verdict }) {
  const map = {
    AC: "bg-emerald-500/15 text-emerald-200 border-emerald-500/20",
    WA: "bg-red-500/15 text-red-200 border-red-500/20",
    TLE: "bg-orange-500/15 text-orange-200 border-orange-500/20",
    RE: "bg-fuchsia-500/15 text-fuchsia-200 border-fuchsia-500/20",
    CE: "bg-sky-500/15 text-sky-200 border-sky-500/20",
  };

  const cls = map[verdict] || "bg-white/5 text-slate-200 border-white/10";

  return (
    <span className={`px-2 py-1 text-xs font-bold rounded-full border ${cls}`}>
      {verdict}
    </span>
  );
}