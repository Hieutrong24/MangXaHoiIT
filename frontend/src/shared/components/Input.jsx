import { cn } from "../utils/cn";

export default function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-400 outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/15",
        className
      )}
      {...props}
    />
  );
}
