// src/shared/components/Avatar.jsx
export default function Avatar({ name = "U", size = 40 }) {
  const letter = String(name).slice(0, 1).toUpperCase();
  return (
    <div
      className="rounded-2xl bg-white/10 border border-white/10 grid place-items-center font-black text-slate-100"
      style={{ width: size, height: size }}
      title={name}
    >
      {letter}
    </div>
  );
}
