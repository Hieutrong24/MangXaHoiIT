import GlassCard from "../../../shared/components/GlassCard";
import Input from "../../../shared/components/Input";
import { FileText } from "lucide-react";

export default function PostListPage() {
  return (
    <div className="grid gap-4">
      <GlassCard className="p-5">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-violet-300" />
          <div className="text-xl font-extrabold tracking-tight">Bài viết</div>
        </div>
        <div className="mt-3">
          <Input placeholder="Tìm bài viết theo tiêu đề / tag..." />
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <div className="text-sm text-slate-300">
          Danh sách bài viết sẽ lấy từ <code className="text-slate-100">/api/content</code> (gateway).
        </div>
        <div className="mt-4 text-xs text-slate-400">
          (Mình sẽ nối API thật cho bạn ngay khi bạn gửi endpoints chuẩn của content-service.)
        </div>
      </GlassCard>
    </div>
  );
}
