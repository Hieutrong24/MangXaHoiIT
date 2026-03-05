import GlassCard from "../../../shared/components/GlassCard";
import { BellRing } from "lucide-react";

export default function NotificationsPage() {
  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-2">
        <BellRing className="h-5 w-5 text-cyan-300" />
        <div className="text-xl font-extrabold tracking-tight">Thông báo</div>
      </div>
      <div className="mt-4 text-sm text-slate-300">
        Like/comment/follow sẽ hiển thị ở đây (từ notification-service qua gateway).
      </div>
    </GlassCard>
  );
}
