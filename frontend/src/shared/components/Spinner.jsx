// src/shared/components/Spinner.jsx
export default function Spinner({ label = "Đang tải..." }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-300">
      <span className="h-4 w-4 rounded-full border-2 border-white/10 border-t-white/60 animate-spin" />
      {label}
    </div>
  );
}
