import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import GlassCard from '../../../shared/components/GlassCard';
import { codejudgeApi } from '../api/codejudge.api';
import LessonItemCard from '../components/LessonItemCard';

function normalizeItemType(item) {
  const raw = String(
    item?.itemType ||
      item?.type ||
      item?.referenceType ||
      item?.contentType ||
      ''
  )
    .trim()
    .toLowerCase();

  if (['problem', 'code', 'coding', 'lab'].includes(raw)) return 'problem';
  return raw;
}

export default function PathDetailPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const res = await codejudgeApi.getLearningPath(slug);
        if (active) setData(res || null);
      } catch (error) {
        console.error('Load learning path failed', error);
        if (active) setData(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [slug]);

  const lessonsWithNext = useMemo(() => {
    return (data?.lessons || []).map((lesson) => {
      const problemIds = (lesson.items || [])
        .filter((item) => normalizeItemType(item) === 'problem' || item?.problemId)
        .map((item) => item.problemId || item.referenceId || item.id)
        .filter(Boolean);

      return {
        ...lesson,
        items: (lesson.items || []).map((item) => {
          const currentProblemId = item.problemId || item.referenceId || item.id;
          const currentIndex = problemIds.findIndex((id) => id === currentProblemId);
          return {
            ...item,
            pathSlug: data?.slug,
            autoNext: true,
            nextProblemId: currentIndex >= 0 ? problemIds[currentIndex + 1] || null : null,
          };
        }),
      };
    });
  }, [data]);

  if (loading) return <div className="text-slate-300">Đang tải lộ trình...</div>;
  if (!data) return <div className="text-slate-300">Không tìm thấy lộ trình.</div>;

  return (
    <div className="space-y-4">
      <GlassCard className="overflow-hidden p-0">
        <div className="bg-[radial-gradient(80%_120%_at_20%_0%,rgba(96,165,250,0.18),transparent_65%),linear-gradient(135deg,rgba(2,6,23,0.98),rgba(15,23,42,0.8))] p-6">
          <div className="text-xs font-semibold uppercase tracking-wide text-sky-300">Learning path</div>
          <div className="mt-2 text-3xl font-black text-white">{data.title}</div>
          <div className="mt-2 max-w-3xl text-sm text-slate-300">{data.description || 'Lộ trình học từ dễ đến khó, chia thành nhiều lesson nhỏ dễ hoàn thành.'}</div>
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-300">
            <span className="rounded-full bg-white/5 px-3 py-1">{data.lessonCount || data.lessons?.length || 0} bài học</span>
            <span className="rounded-full bg-white/5 px-3 py-1">+{data.totalXpReward || data.pointsReward || 0} XP</span>
            <span className="rounded-full bg-white/5 px-3 py-1">{Math.round(data.progressPercent || 0)}% hoàn thành</span>
          </div>
        </div>
      </GlassCard>

      {data.state === 'locked' ? (
        <GlassCard className="border-amber-300/20 bg-amber-400/10 p-4 text-sm text-amber-100">
          Lộ trình này đang bị khóa. {data.requirementSummary ? `Yêu cầu: ${data.requirementSummary}.` : 'Hoàn thành các path trước hoặc tích lũy thêm XP để mở.'}
        </GlassCard>
      ) : null}

      <div className="space-y-4">
        {lessonsWithNext.map((lesson, index) => (
          <GlassCard key={lesson.lessonId || index} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Lesson {index + 1}</div>
                <div className="mt-1 text-xl font-bold text-white">{lesson.title}</div>
                <div className="mt-2 text-sm text-slate-400">{lesson.summary || lesson.description || 'Một lesson ngắn gọn, tập trung vào một kỹ năng chính.'}</div>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">{lesson.estimatedMinutes || 5} phút</div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {(lesson.items || []).map((item) => (
                <LessonItemCard
                  key={item.lessonItemId || item.itemId || `${lesson.lessonId}-${item.orderNo}`}
                  item={item}
                  lessonId={lesson.lessonId || lesson.id}
                />
              ))}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
