import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Crown, Gem, ShieldCheck, Target } from 'lucide-react';
import GlassCard from '../../../shared/components/GlassCard';
import { codejudgeApi } from '../api/codejudge.api';
import ProgressRing from '../components/ProgressRing';
import StreakPill from '../components/StreakPill';
import JourneyPathMap from '../components/JourneyPathMap';
import QuestCard from '../components/QuestCard';
import BadgeShelf from '../components/BadgeShelf';

function StatTile({ icon: Icon, label, value, hint, tone = 'emerald' }) {
  const palette = {
    emerald: 'border-emerald-300/20 bg-emerald-500/10 text-emerald-300',
    sky: 'border-sky-300/20 bg-sky-500/10 text-sky-300',
    amber: 'border-amber-300/20 bg-amber-500/10 text-amber-300',
    violet: 'border-violet-300/20 bg-violet-500/10 text-violet-300',
  };
  return (
    <div className="h-full rounded-[28px] border border-[color:var(--border-soft)] bg-[var(--surface-muted)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3">
          <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl border ${palette[tone] || palette.emerald}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">{label}</div>
        </div>
        <div className="mt-5 text-3xl font-black leading-none text-[var(--text-primary)]">{value}</div>
        <div className="mt-4 min-h-[44px] text-sm leading-6 text-[var(--text-secondary)]">{hint || ' '}</div>
      </div>
    </div>
  );
}

export default function LearnHomePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const refreshKey = useMemo(() => searchParams.get("refresh"), [searchParams]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const res = await codejudgeApi.getLearnDashboard();
        if (active) {
          setData(res || {});
        }
      } catch (error) {
        console.error('Load learning dashboard failed', error);
        if (active) setData({});
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [refreshKey]);

  const overview = useMemo(() => ({
    totalXp: data?.totalXp ?? 0,
    currentStreak: data?.currentStreak ?? 0,
    level: data?.level ?? 1,
    completedLessons: data?.completedLessons ?? 0,
    completedProblems: data?.completedProblems ?? 0,
    badgesCount: data?.badgesCount ?? (data?.badges?.length || 0),
    progressPercent: data?.progressPercent ?? 0,
  }), [data]);

  if (loading) return <div className="text-[var(--text-secondary)]">Đang tải hành trình học...</div>;

  return (
    <div className="space-y-4">
      <GlassCard className="overflow-hidden p-0">
        <div className="bg-[radial-gradient(90%_120%_at_20%_0%,rgba(52,211,153,0.2),transparent_65%),linear-gradient(135deg,color-mix(in_srgb,var(--surface-card-solid)_92%,#020617_8%),color-mix(in_srgb,var(--surface-card)_88%,#dbeafe_12%))] p-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_180px] xl:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--text-primary)]">Học siêu nhỏ · game hóa </div>
              <div className="mt-4 text-3xl font-black tracking-tight text-[var(--text-primary)]">Hành trình lập trình  </div>
              <div className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">Các bài học ngắn, quiz nhanh, thử thách code, nhận XP và mở khóa huy hiệu theo từng chặng.</div>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <StreakPill streak={overview.currentStreak} />
                <Link to="/code/problems" className="rounded-full border border-[color:var(--border-soft)] bg-[var(--surface-muted)] px-5 py-3 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[color:var(--border-strong)] hover:bg-[var(--surface-card)]">Mở kho thử thách</Link>
              </div>
            </div>
            <div className="flex justify-center xl:justify-end">
              <ProgressRing value={overview.progressPercent} label="Tiến độ" suffix="%" />
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatTile icon={Gem} label="Tổng XP" value={overview.totalXp} hint="Tích lũy từ lesson, quiz, challenge" tone="amber" />
        <StatTile icon={Crown} label="Cấp độ" value={overview.level} hint="Mở khóa bằng cách hoàn thành path" tone="sky" />
        <StatTile icon={Target} label="Bài học đã xong" value={overview.completedLessons} hint={`${overview.completedProblems} thử thách code đã giải`} tone="emerald" />
        <StatTile icon={ShieldCheck} label="Huy hiệu" value={overview.badgesCount} hint="Các cột mốc và thành tích đặc biệt" tone="violet" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <GlassCard className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-lg font-bold text-[var(--text-primary)]">Con đường học tập</div>
              <div className="text-sm text-[var(--text-muted)]">Mỗi path là một kỹ năng lớn, chia thành lesson nhỏ và quiz ngắn.</div>
            </div>
          </div>
          <JourneyPathMap items={data?.journey || data?.paths || []} />
        </GlassCard>

        <div className="space-y-4">
          <GlassCard className="p-5">
            <div className="mb-4 text-lg font-bold text-[var(--text-primary)]">Thử thách hôm nay</div>
            <div className="space-y-3">
              {(data?.dailyChallenges || []).length ? (data.dailyChallenges || []).map((item) => <QuestCard key={item.challengeId || item.title} item={item} />) : <QuestCard item={{ title: 'Làm 1 quiz lý thuyết', description: 'Hoàn thành ít nhất một quiz để duy trì streak.', rewardXp: 15, progressPercent: 0 }} />}
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <div className="mb-4 text-lg font-bold text-[var(--text-primary)]">Huy hiệu gần đây</div>
            <BadgeShelf badges={data?.badges || []} />
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
