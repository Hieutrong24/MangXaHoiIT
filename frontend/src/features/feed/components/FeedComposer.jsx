import GlassCard from "../../../shared/components/GlassCard";
import Button from "../../../shared/components/Button";
import { Plus, Brain, Code } from "lucide-react";
import { Link } from "react-router-dom";
export default function FeedComposer() {
  return (
    <GlassCard className="p-4 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-xl">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-cyan-400/25 via-purple-500/15 to-pink-500/15 border border-white/10" />
        <div className="flex-1">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10 transition">
            <div className="text-sm text-slate-300">
              Bạn đang build gì hôm nay? Chia sẻ note, snippet, hoặc câu hỏi môn học…
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Link to="/posts/new">
              <Button variant="ghost" className="gap-2">
                <Plus className="h-4 w-4" />
                Tạo bài
              </Button>
            </Link>
            <Button variant="ghost" className="gap-2">
              <Code className="h-4 w-4" />
              Code snippet
            </Button>
            <Button variant="ghost" className="gap-2">
              <Brain className="h-4 w-4" />
              AI gợi ý
            </Button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}