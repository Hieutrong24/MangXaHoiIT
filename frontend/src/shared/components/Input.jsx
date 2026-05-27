import { cn } from "../utils/cn";

export default function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] outline-none transition-all duration-200 hover:border-white/15 focus:border-cyan-400/50 focus:bg-slate-900 focus:ring-4 focus:ring-cyan-400/10",
        className
      )}
      {...props}
    />
  );
}
