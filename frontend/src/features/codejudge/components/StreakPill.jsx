import { Flame } from 'lucide-react';

export default function StreakPill({ streak = 0, text }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-amber-400/10 px-4 py-2 text-[var(--text-primary)] shadow-[0_10px_30px_rgba(251,191,36,0.12)]">
      <span className="grid h-8 w-8 place-items-center rounded-full bg-amber-400/15 text-amber-300">
        <Flame className="h-4 w-4" />
      </span>
      <div>
        <div className="text-sm font-semibold">{streak} ngày liên tiếp</div>
        <div className="text-[11px] text-[var(--text-muted)]">{text || 'Giữ chuỗi học mỗi ngày để nhận thêm XP'}</div>
      </div>
    </div>
  );
}
