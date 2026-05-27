// src/shared/components/EmptyState.jsx
import { Sparkles } from "lucide-react";

export default function EmptyState({
  title = "Chưa có dữ liệu",
  desc = "Hãy thử đổi bộ lọc hoặc tạo nội dung mới.",
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 text-center shadow-[0_14px_36px_rgba(0,0,0,0.28)] ring-1 ring-inset ring-white/5 sm:p-8">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/15 via-blue-500/10 to-violet-500/15 shadow-inner shadow-cyan-500/10">
        <Sparkles className="h-5 w-5 text-cyan-300" />
      </div>
      <div className="mt-4 text-base font-extrabold tracking-tight text-slate-50 sm:text-lg">{title}</div>
      <div className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">{desc}</div>
    </div>
  );
}
