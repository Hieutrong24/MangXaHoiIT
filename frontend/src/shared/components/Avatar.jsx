// src/shared/components/Avatar.jsx
export default function Avatar({ name = "U", size = 40 }) {
  const letter = String(name).slice(0, 1).toUpperCase();

  return (
    <div
      className="grid place-items-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 font-black text-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.35)] ring-1 ring-inset ring-white/5"
      style={{ width: size, height: size, fontSize: Math.max(14, size * 0.36) }}
      title={name}
    >
      <span className="select-none">{letter}</span>
    </div>
  );
}
