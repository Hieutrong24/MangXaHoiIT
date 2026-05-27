import { Link } from 'react-router-dom';
import { BookOpenCheck, CheckCircle2, Crown, Lock, Star } from 'lucide-react';

function nodeIcon(state) {
  if (state === 'completed') return <CheckCircle2 className="h-4 w-4" />;
  if (state === 'locked') return <Lock className="h-4 w-4" />;
  if (state === 'boss') return <Crown className="h-4 w-4" />;
  return <Star className="h-4 w-4" />;
}

export default function JourneyPathMap({ items = [] }) {
  if (!items.length) {
    return <div className="rounded-3xl border border-[color:var(--border-soft)] bg-[var(--surface-muted)] p-5 text-sm text-[var(--text-muted)]">Chưa có learning path nào được cấu hình.</div>;
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
  const state = item?.state || 'active';
  const isSpecialPath = item?.slug === 'path-001-tong-hai-so-nguyen';
  const canOpen = state !== 'locked' || isSpecialPath;
  const displayState = canOpen ? 'active' : state;
  return (
          <div key={item.pathId || item.slug || index} className="relative pl-8">
            {index < items.length - 1 ? <div className="absolute left-[18px] top-12 h-[calc(100%+10px)] w-px bg-gradient-to-b from-emerald-400/40 to-transparent" /> : null}
            <div className="absolute left-0 top-3">
              <div className={`grid h-9 w-9 place-items-center rounded-full border ${displayState === 'completed' ? 'border-emerald-300/30 bg-emerald-500/15 text-emerald-300' : displayState === 'locked' ? 'border-[color:var(--border-soft)] bg-[var(--surface-muted)] text-[var(--text-muted)]' : 'border-sky-300/30 bg-sky-500/15 text-sky-200'}`}>
                {nodeIcon(displayState)}
              </div>
            </div>
            <div className="rounded-3xl border border-[color:var(--border-soft)] bg-[var(--surface-muted)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-[var(--text-primary)]">{item.title}</div>
                  <div className="mt-1 text-xs text-[var(--text-muted)]">{item.description || 'Chuỗi bài học ngắn để đi từ dễ đến khó.'}</div>
                </div>
                <div className="rounded-full bg-[var(--surface-card)] px-3 py-1 text-[11px] uppercase tracking-wide text-[var(--text-secondary)]">
                  {item.levelLabel || item.difficultyLabel || 'Lộ trình'}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)]">
                <span>{item.lessonCount || 0} bài học</span>
                <span>{item.completedLessonCount || 0} đã xong</span>
                <span>+{item.pointsReward || item.totalXpReward || 0} XP</span>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="h-2 flex-1 rounded-full bg-[var(--surface-card)]">
                  <div className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-sky-400" style={{ width: `${Math.max(0, Math.min(100, Number(item.progressPercent ?? 0)))}%` }} />
                </div>
                {canOpen ? (
                  <Link to={`/code/paths/${item.slug}`} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 to-sky-400 px-4 py-2 text-xs font-semibold text-slate-950">
                    <BookOpenCheck className="h-4 w-4" /> Mở
                  </Link>
                ) : (
                  <span className="rounded-full border border-[color:var(--border-soft)] bg-[var(--surface-card)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)]">Khóa</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
