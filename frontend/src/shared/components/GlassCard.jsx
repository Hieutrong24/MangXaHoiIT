import { cn } from "../utils/cn";

export default function GlassCard({ className, children }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-soft",
        className
      )}
    >
      {children}
    </div>
  );
}
