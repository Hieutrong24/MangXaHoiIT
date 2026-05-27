import { Link, createSearchParams } from 'react-router-dom';
import { BookOpenText, Code2, FileQuestion, Lock, Timer } from 'lucide-react';

function normalizeType(item) {
  const raw = String(
    item?.itemType ||
      item?.type ||
      item?.referenceType ||
      item?.contentType ||
      'reading'
  )
    .trim()
    .toLowerCase();

  if (['quiz', 'trac-nghiem', 'mcq'].includes(raw)) return 'quiz';
  if (['problem', 'code', 'coding', 'lab'].includes(raw)) return 'problem';
  if (['lesson'].includes(raw)) return 'lesson';
  if (['reading', 'content', 'article', 'theory', 'note', 'markdown'].includes(raw)) return 'reading';

  return 'reading';
}

function ItemIcon({ type }) {
  if (type === 'quiz') return <FileQuestion className="h-5 w-5" />;
  if (type === 'problem') return <Code2 className="h-5 w-5" />;
  return <BookOpenText className="h-5 w-5" />;
}

function getItemId(item) {
  return item?.lessonItemId || item?.itemId || item?.id || item?.referenceId || null;
}

function buildHref(item, type, lessonId) {
  const itemId = getItemId(item);

  if (type === 'quiz') {
    const quizId = item?.quizId || item?.referenceId || item?.id;
    return quizId ? `/code/quizzes/${quizId}` : null;
  }

  if (type === 'problem') {
    const problemId = item?.problemId || item?.referenceId || item?.id;
    if (!problemId) return null;
    const params = {};
    if (item?.nextProblemId) params.nextProblemId = item.nextProblemId;
    if (item?.pathSlug) params.pathSlug = item.pathSlug;
    if (item?.autoNext !== false) params.autoNext = '1';
    if (lessonId) params.lessonId = lessonId;
    if (item.lessonItemId) params.lessonItemId = item.lessonItemId;
    const query = Object.keys(params).length ? `?${createSearchParams(params).toString()}` : '';
    return `/code/problems/${problemId}${query}`;
  }

  if (type === 'lesson') {
    const targetLessonId = item?.referenceId || lessonId || item?.id;
    return targetLessonId ? `/code/lessons/${targetLessonId}` : null;
  }

  if (lessonId) {
    return itemId ? `/code/lessons/${lessonId}#item-${itemId}` : `/code/lessons/${lessonId}`;
  }

  if (item?.referenceId) {
    return `/code/lessons/${item.referenceId}`;
  }

  return null;
}

function typeLabel(type) {
  if (type === 'quiz') return 'quiz';
  if (type === 'problem') return 'code';
  if (type === 'lesson') return 'lesson';
  return 'reading';
}

export default function LessonItemCard({ item, lessonId }) {
  const type = normalizeType(item);
  const locked = Boolean(item?.isLocked ?? item?.locked ?? item?.isUnlocked === false);
  const href = locked ? null : buildHref(item, type, lessonId || item?.lessonId || item?.parentLessonId || null);
  const estimatedMinutes = item?.estimatedMinutes || item?.durationMinutes || 5;
  const xp = item?.pointsReward ?? item?.xpReward ?? 0;
  const title = item?.title || item?.label || 'Nội dung bài học';
  const description = item?.description || item?.contentSnippet || item?.summary || 'Bước học nhỏ, rõ ràng và dễ hoàn thành.';

  const body = (
    <div className={[
      'rounded-3xl border p-4 transition',
      locked
        ? 'cursor-not-allowed border-white/5 bg-white/[0.02] opacity-70'
        : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.06] hover:border-white/15'
    ].join(' ')}>
      <div className="flex items-start gap-3">
        <div className={[
          'grid h-11 w-11 shrink-0 place-items-center rounded-2xl',
          locked ? 'bg-slate-500/10 text-slate-400' : 'bg-sky-500/12 text-sky-300'
        ].join(' ')}>
          {locked ? <Lock className="h-5 w-5" /> : <ItemIcon type={type} />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-sm font-semibold text-white">{title}</div>

            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-wide text-slate-400">
              {typeLabel(type)}
            </span>

            {locked ? (
              <span className="rounded-full border border-amber-300/15 bg-amber-400/10 px-2.5 py-1 text-[10px] uppercase tracking-wide text-amber-200">
                bị khóa
              </span>
            ) : null}
          </div>

          <div className="mt-1 text-xs text-slate-400">{description}</div>

          <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Timer className="h-3.5 w-3.5" />
              {estimatedMinutes} phút
            </span>

            {xp > 0 ? <span className="font-semibold text-amber-300">+{xp} XP</span> : null}

            {!locked && href ? (
              <span className="font-medium text-emerald-300">
                {type === 'problem' ? 'Mở thử thách' : type === 'quiz' ? 'Bắt đầu quiz' : 'Mở bài học'}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );

  if (href) return <Link to={href}>{body}</Link>;
  return body;
}
