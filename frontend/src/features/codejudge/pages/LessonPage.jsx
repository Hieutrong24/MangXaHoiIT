import { useEffect, useMemo, useState } from 'react';
import GlassCard from '../../../shared/components/GlassCard';
import Button from '../../../shared/components/Button';
import { codejudgeApi } from '../api/codejudge.api';
import { useParams } from 'react-router-dom';
import LessonItemCard from '../components/LessonItemCard';

function normalizeItemType(item) {
  const raw = String(
    item?.itemType ||
      item?.type ||
      item?.referenceType ||
      item?.contentType ||
      'reading'
  )
    .trim()
    .toLowerCase();

  if (['problem', 'code', 'coding', 'lab'].includes(raw)) return 'problem';
  if (['quiz', 'trac-nghiem', 'mcq'].includes(raw)) return 'quiz';
  return 'reading';
}

export default function LessonPage() {
  const { lessonId } = useParams();
  const [data, setData] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const itemAnchors = useMemo(
    () =>
      (data?.items || []).map((item, index) => ({
        id: item.lessonItemId || item.itemId || item.referenceId || `item-${index}`,
        title: item.title || `Mục ${index + 1}`,
        description: item.description || item.summary || item.contentSnippet || item.contentMarkdown || '',
      })),
    [data]
  );

  const hasLockedProgressItems = useMemo(
    () => (data?.items || []).some((item) => ['problem', 'quiz'].includes(normalizeItemType(item))),
    [data]
  );

  useEffect(() => {
    if (!data) return;
    const hash = window.location.hash?.replace('#', '');
    if (!hash) return;
    const el = document.getElementById(hash);
    if (el) {
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [data]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const res = await codejudgeApi.getLesson(lessonId);
        if (active) {
          setData(res || null);
          setCompleted(!!res?.isCompleted);
        }
      } catch (error) {
        console.error('Load lesson failed', error);
        if (active) setData(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [lessonId]);

  const handleComplete = async () => {
    try {
      setSaving(true);
      await codejudgeApi.completeLesson(lessonId, { completed: true });
      setCompleted(true);
    } catch (error) {
      console.error('Complete lesson failed', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-slate-300">Đang tải lesson...</div>;
  if (!data) return <div className="text-slate-300">Không tìm thấy lesson.</div>;

  return (
    <div className="space-y-4">
      <GlassCard className="overflow-hidden p-0">
        <div className="bg-[radial-gradient(80%_120%_at_20%_0%,rgba(52,211,153,0.18),transparent_65%),linear-gradient(135deg,rgba(2,6,23,0.98),rgba(15,23,42,0.8))] p-6">
          <div className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Lesson</div>
          <div className="mt-2 text-3xl font-black text-white">{data.title}</div>
          <div className="mt-2 max-w-3xl text-sm text-slate-300">{data.summary || data.description || 'Một lesson ngắn, rõ ràng và có thể hoàn thành nhanh.'}</div>
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-300">
            <span className="rounded-full bg-white/5 px-3 py-1">{data.estimatedMinutes || 5} phút</span>
            <span className="rounded-full bg-white/5 px-3 py-1">+{data.pointsReward || 0} XP</span>
            <span className={`rounded-full px-3 py-1 ${completed ? 'bg-emerald-500/15 text-emerald-200' : 'bg-white/5 text-slate-300'}`}>
              {completed ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
            </span>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <div className="prose prose-invert max-w-none text-slate-200">
          <p>{data.content || data.body || 'Lesson này tập trung vào một ý chính, giúp sinh viên học theo bước nhỏ và dễ tiêu hóa.'}</p>
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <div className="mb-4 text-lg font-bold text-white">Các chặng nhỏ trong lesson</div>
        <div className="space-y-3">
          {itemAnchors.map((item, index) => (
            <div key={item.id} id={`item-${item.id}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-xs uppercase tracking-wide text-cyan-300">Item {index + 1}</div>
              <div className="mt-1 text-base font-semibold text-white">{item.title}</div>
              <div className="mt-2 text-sm text-slate-300">{item.description || 'Hoàn thành mục này để mở tiếp các bước kế tiếp.'}</div>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <div className="mb-4 text-lg font-bold text-white">Nội dung trong lesson</div>
        <div className="grid gap-3 md:grid-cols-2">
          {(data.items || []).map((item) => (
            <LessonItemCard key={item.lessonItemId || item.itemId || item.referenceId} item={item} lessonId={data.lessonId || lessonId} />
          ))}
        </div>

        {!hasLockedProgressItems ? (
          <div className="mt-5 flex justify-end">
            <Button onClick={handleComplete} disabled={saving || completed}>
              {completed ? 'Đã hoàn thành' : saving ? 'Đang lưu...' : 'Đánh dấu hoàn thành'}
            </Button>
          </div>
        ) : null}
      </GlassCard>
    </div>
  );
}
