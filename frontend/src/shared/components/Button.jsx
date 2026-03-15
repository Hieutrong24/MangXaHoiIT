import { cn } from "../utils/cn";

export default function Button({ className, variant = "primary", ...props }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-gradient-to-r from-violet-500 via-cyan-500 to-emerald-500 text-slate-950 hover:brightness-110",
    ghost: "bg-white/5 hover:bg-white/10 border border-white/10",
    danger: "bg-red-500/90 hover:bg-red-500 text-white",
  };

  return <button className={cn(base, variants[variant], className)} {...props} />;
}
