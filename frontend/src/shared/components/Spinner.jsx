// src/shared/components/Spinner.jsx
export default function Spinner({ label = "Đang tải..." }) {
  return (
    <div className="inline-flex items-center gap-3 rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-300">
      <span className="h-4 w-4 rounded-full border-2 border-white/10 border-t-cyan-300 animate-spin" />
      <span>{label}</span>
    </div>
  );
}
