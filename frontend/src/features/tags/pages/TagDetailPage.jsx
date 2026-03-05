import { useParams } from "react-router-dom";
import GlassCard from "../../../shared/components/GlassCard";

export default function TagDetailPage() {
  const { slug } = useParams();
  return (
    <div className="grid gap-4">
      <GlassCard className="p-6">
        <div className="text-xl font-extrabold tracking-tight">#{slug}</div>
        <div className="mt-2 text-sm text-slate-300">
          Trang tổng hợp bài viết theo tag (trending, newest, top contributors).
        </div>
      </GlassCard>
    </div>
  );
}
