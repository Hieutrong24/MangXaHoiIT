import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import GlassCard from '../../../shared/components/GlassCard';
import Button from '../../../shared/components/Button';
import { codejudgeApi } from '../api/codejudge.api';
import QuizQuestionCard from '../components/QuizQuestionCard';

export default function QuizPage() {
  const { quizId } = useParams();
  const [data, setData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const res = await codejudgeApi.getQuiz(quizId);
        if (active) setData(res || null);
      } catch (error) {
        console.error('Load quiz failed', error);
        if (active) setData(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [quizId]);

  const questionCount = data?.questions?.length || 0;
  const answeredCount = useMemo(() => Object.values(answers).filter(Boolean).length, [answers]);

  const handleSelect = (questionId, choiceId) => setAnswers((prev) => ({ ...prev, [questionId]: choiceId }));

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const payload = {
        answers: Object.entries(answers).map(([questionId, choiceId]) => ({ questionId, choiceId })),
      };
      const res = await codejudgeApi.submitQuizAttempt(quizId, payload);
      setResult(res || null);
    } catch (error) {
      console.error('Submit quiz failed', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-slate-300">Đang tải quiz...</div>;
  if (!data) return <div className="text-slate-300">Không tìm thấy quiz.</div>;

  return (
    <div className="space-y-4">
      <GlassCard className="overflow-hidden p-0">
        <div className="bg-[radial-gradient(80%_120%_at_20%_0%,rgba(167,139,250,0.18),transparent_65%),linear-gradient(135deg,rgba(2,6,23,0.98),rgba(15,23,42,0.8))] p-6">
          <div className="text-xs font-semibold uppercase tracking-wide text-violet-300">Quiz</div>
          <div className="mt-2 text-3xl font-black text-white">{data.title}</div>
          <div className="mt-2 text-sm text-slate-300">{data.description || 'Bài trắc nghiệm ngắn để củng cố kiến thức sau lesson.'}</div>
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-300">
            <span className="rounded-full bg-white/5 px-3 py-1">{questionCount} câu hỏi</span>
            <span className="rounded-full bg-white/5 px-3 py-1">Đã trả lời {answeredCount}/{questionCount}</span>
            {data.pointsReward ? <span className="rounded-full bg-amber-400/15 px-3 py-1 text-amber-200">+{data.pointsReward} XP</span> : null}
          </div>
        </div>
      </GlassCard>

      <div className="space-y-4">
        {(data.questions || []).map((question, index) => (
          <QuizQuestionCard
            key={question.questionId || index}
            question={question}
            index={index}
            value={answers[question.questionId]}
            onChange={(choiceId) => handleSelect(question.questionId, choiceId)}
            reveal={!!result}
          />
        ))}
      </div>

      <GlassCard className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-300">Hoàn thành tất cả câu hỏi để nhận kết quả và XP.</div>
          <Button onClick={handleSubmit} disabled={submitting || answeredCount === 0}>{submitting ? 'Đang nộp...' : 'Nộp quiz'}</Button>
        </div>
        {result ? (
          <div className="mt-4 rounded-3xl border border-emerald-300/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
            <div className="font-semibold">Kết quả: {result.correctCount ?? 0}/{result.totalQuestions ?? questionCount} câu đúng</div>
            <div className="mt-1">Điểm: {result.score ?? 0}% · Nhận được {result.earnedXp ?? 0} XP</div>
          </div>
        ) : null}
      </GlassCard>
    </div>
  );
}
