import { CheckCircle2, Sparkles } from 'lucide-react';

export default function QuestCard({ item }) {
  const progress = Math.max(0, Math.min(100, Number(item?.progressPercent ?? 0)));
  const done = !!item?.isCompleted;
  return (
    <div className="rounded-3xl border border-[color:var(--border-soft)] bg-[var(--surface-muted)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-[var(--text-primary)]">{item?.title || 'Nhiệm vụ hằng ngày'}</div>
          <div className="mt-1 text-xs text-[var(--text-muted)]">{item?.description || 'Hoàn thành thử thách để nhận XP thưởng.'}</div>
        </div>
        <div className={`grid h-10 w-10 place-items-center rounded-2xl ${done ? 'bg-emerald-500/15 text-emerald-300' : 'bg-violet-500/15 text-violet-300'}`}>
          {done ? <CheckCircle2 className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
        </div>
      </div>
      <div className="mt-4 h-2 rounded-full bg-[var(--surface-card)]">
        <div className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-sky-400" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-[var(--text-muted)]">
        <span>{item?.progressText || `${Math.round(progress)}% hoàn thành`}</span>
        <span className="font-semibold text-amber-300">+{item?.rewardXp ?? 0} XP</span>
      </div>
    </div>
  );
}
