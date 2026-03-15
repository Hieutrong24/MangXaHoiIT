// src/shared/components/EmptyState.jsx
import { Sparkles } from "lucide-react";

export default function EmptyState({ title = "Chưa có dữ liệu", desc = "Hãy thử đổi bộ lọc hoặc tạo nội dung mới." }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
      <div className="mx-auto h-12 w-12 rounded-2xl bg-white/10 grid place-items-center">
        <Sparkles className="h-5 w-5 text-cyan-300" />
      </div>
      <div className="mt-3 font-extrabold">{title}</div>
      <div className="mt-1 text-sm text-slate-300">{desc}</div>
    </div>
  );
}
