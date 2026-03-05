import GlassCard from "../../../shared/components/GlassCard";
import Button from "../../../shared/components/Button";
import { Sparkles, Hash, Flame } from "lucide-react";
import { cx } from "../utils/feedHelpers";

export default function FeedHeroHeader() {
  return (
    <div className="mb-5">
      <GlassCard
        className={cx(
          "p-5 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-xl",
          "shadow-[0_0_0_1px_rgba(34,211,238,0.12),0_14px_40px_rgba(0,0,0,0.55)]"
        )}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-xl font-extrabold tracking-tight flex items-center gap-2 text-slate-100">
              <Sparkles className="h-5 w-5 text-cyan-200" />
              Bảng tin kiến thức
              <span className="ml-2 text-[11px] px-2 py-1 rounded-full border border-white/10 bg-white/5 text-slate-200/80">
                Dark Cyber
              </span>
            </div>
            <div className="text-sm text-slate-300 mt-1">
              Nơi tổng hợp bài viết mới, trending và note môn học — tối ưu cho sinh viên IT.
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" className="gap-2">
              <Hash className="h-4 w-4" />
              Theo dõi tag
            </Button>
            <Button
                variant="ghost"
                className="gap-2 
                bg-slate-800/60 
                hover:bg-slate-700/60 
                text-slate-200 
                border border-slate-700 
                backdrop-blur-md"
              >
                <Flame className="h-4 w-4 fill-orange-500 stroke-orange-600" />
                Khám phá
              </Button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}