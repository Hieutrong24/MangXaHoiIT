import GlassCard from "../../../shared/components/GlassCard";
import Button from "../../../shared/components/Button";
import { Plus, Brain, Code, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function FeedComposer() {
  return (
    <GlassCard className="group relative overflow-hidden rounded-[28px] border border-[color:var(--border-soft)] bg-[var(--surface-card)] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.24)] backdrop-blur-2xl sm:p-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.14),transparent_28%)]" />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex items-center gap-3 sm:w-auto">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/10 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <Sparkles className="h-5 w-5 text-cyan-200" />
          </div>

            <div className="sm:hidden">
              <div className="text-sm font-semibold text-[var(--text-primary)]">Tạo nhanh bài viết</div>
              <div className="text-xs text-[var(--text-muted)]">Giao diện tối ưu kiểu Discord + GitHub</div>
            </div>
          </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-primary)]">
              Composer
            </span>
            <span className="hidden text-xs text-[var(--text-muted)] sm:inline">Bắt đầu một thảo luận mới, snippet hoặc note môn học</span>
          </div>

          <div className="mt-3 rounded-[24px] border border-[color:var(--border-soft)] bg-[var(--surface-muted)] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition duration-200 group-hover:border-cyan-300/20 group-hover:bg-[var(--surface-card)] sm:px-5">
            <div className="text-sm leading-6 text-[var(--text-secondary)] sm:text-[15px]">
              Bạn đang build gì hôm nay? Chia sẻ note, snippet, hoặc câu hỏi môn học…
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2.5">
            <Link to="/posts/new" className="contents">
              <Button
                variant="ghost"
                className="h-11 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 text-[var(--text-primary)] shadow-[0_12px_30px_rgba(34,211,238,0.10)] hover:bg-cyan-400/15"
              >
                <span className="inline-flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Tạo bài
                </span>
              </Button>
            </Link>

            <Button
              variant="ghost"
              className="h-11 rounded-2xl border border-[color:var(--border-soft)] bg-[var(--surface-muted)] px-4 text-[var(--text-secondary)] hover:bg-[var(--surface-card)]"
            >
              <span className="inline-flex items-center gap-2">
                <Code className="h-4 w-4 text-violet-200" />
                Code snippet
              </span>
            </Button>

            <Button
              variant="ghost"
              className="h-11 rounded-2xl border border-[color:var(--border-soft)] bg-[var(--surface-muted)] px-4 text-[var(--text-secondary)] hover:bg-[var(--surface-card)]"
            >
              <span className="inline-flex items-center gap-2">
                <Brain className="h-4 w-4 text-cyan-200" />
                AI gợi ý
              </span>
            </Button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
