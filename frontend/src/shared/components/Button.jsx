import { cn } from "../utils/cn";

export default function Button({ className, variant = "primary", ...props }) {
  const base =
    "inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40";

  const variants = {
    primary:
      "border-cyan-400/20 bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400 text-slate-950 shadow-[0_10px_24px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 hover:brightness-110",
    ghost:
      "border-[color:var(--border-soft)] bg-[var(--surface-card)] text-[var(--text-primary)] hover:border-[color:var(--border-strong)] hover:bg-[var(--surface-strong)]",
    danger:
      "border-red-400/20 bg-red-500/90 text-white shadow-[0_10px_24px_rgba(239,68,68,0.28)] hover:-translate-y-0.5 hover:bg-red-500",
  };

  return <button className={cn(base, variants[variant], className)} {...props} />;
}
