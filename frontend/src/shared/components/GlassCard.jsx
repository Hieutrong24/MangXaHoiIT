import { cn } from "../utils/cn";

export default function GlassCard({ className, children }) {
  return (
    <div
      className={cn(
        "ui-surface-card rounded-3xl border backdrop-blur-xl shadow-[0_18px_40px_rgba(0,0,0,0.18)] ring-1 ring-inset ring-white/5",
        className
      )}
    >
      {children}
    </div>
  );
}
