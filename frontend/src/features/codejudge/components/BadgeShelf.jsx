import { Award, Lock } from 'lucide-react';

export default function BadgeShelf({ badges = [] }) {
  if (!badges.length) {
    return <div className="rounded-3xl border border-[color:var(--border-soft)] bg-[var(--surface-muted)] p-4 text-sm text-[var(--text-muted)]">Chưa có huy hiệu. Hoàn thành lesson và challenge để mở khóa.</div>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
      {badges.map((badge) => {
        const unlocked = badge?.isUnlocked ?? badge?.earnedAt != null;
        return (
          <div key={badge.badgeId || badge.code || badge.title} className="rounded-3xl border border-[color:var(--border-soft)] bg-[var(--surface-muted)] p-4">
            <div className="flex items-start gap-3">
              <div className={`grid h-12 w-12 place-items-center rounded-2xl ${unlocked ? 'bg-amber-400/15 text-amber-300' : 'bg-[var(--surface-card)] text-[var(--text-muted)]'}`}>
                {unlocked ? <Award className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-[var(--text-primary)]">{badge.title || badge.name}</div>
                <div className="mt-1 text-xs text-[var(--text-muted)]">{badge.description || 'Hoàn thành một cột mốc học tập để mở khóa.'}</div>
                <div className="mt-2 text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
                  {unlocked ? 'Đã mở khóa' : 'Chưa mở khóa'}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
