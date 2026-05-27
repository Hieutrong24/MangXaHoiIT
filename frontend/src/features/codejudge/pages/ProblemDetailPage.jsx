import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import GlassCard from '../../../shared/components/GlassCard';
import Button from '../../../shared/components/Button';
import { codejudgeApi } from '../api/codejudge.api';
import ProblemStatCard from '../components/ProblemStatCard';
import SampleTestCases from '../components/SampleTestCases';

function difficultyLabel(d) {
  if (d <= 1) return 'Dễ';
  if (d === 2) return 'Trung Bình';
  if (d === 3) return 'Khó';
  return 'Nâng cao';
}

export default function ProblemDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [problem, setProblem] = useState(null);
  const [overview, setOverview] = useState(null);
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const [problemRes, overviewRes, testCaseRes] = await Promise.all([
          codejudgeApi.getProblem(id),
          codejudgeApi.getProblemOverview(id),
          codejudgeApi.listProblemTestCases(id),
        ]);
        if (!alive) return;
        setProblem(problemRes || null);
        setOverview(overviewRes || null);
        setSamples((Array.isArray(testCaseRes) ? testCaseRes : []).filter((item) => item.isSample));
      } catch (error) {
        console.error('Load problem detail failed', error);
        if (alive) {
          setProblem(null);
          setOverview(null);
          setSamples([]);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  const statement = useMemo(() => problem?.statement || overview?.statement || '', [problem, overview]);
  if (loading) return <div className="text-slate-300">Đang tải bài...</div>;
  if (!problem && !overview) return <div className="text-slate-300">Không tìm thấy bài.</div>;

  const data = overview || problem;
  const nextProblemId = searchParams.get('nextProblemId');
  const pathSlug = searchParams.get('pathSlug');
  const autoNext = searchParams.get('autoNext');
  const lessonId = searchParams.get('lessonId');
  const lessonItemId = searchParams.get('lessonItemId');
  const submitQuery = new URLSearchParams();
  if (nextProblemId) submitQuery.set('nextProblemId', nextProblemId);
  if (pathSlug) submitQuery.set('pathSlug', pathSlug);
  if (autoNext) submitQuery.set('autoNext', autoNext);
  if (lessonId) submitQuery.set('lessonId', lessonId);
  if (lessonItemId) submitQuery.set('lessonItemId', lessonItemId);
  const submitHref = `/code/submit/${data.problemId || id}${submitQuery.toString() ? `?${submitQuery.toString()}` : ''}`;

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-4">
        <GlassCard className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold uppercase tracking-wide text-emerald-300">{data.problemCode || data.slug}</div>
              <div className="mt-1 text-2xl font-black tracking-tight text-white">{data.title}</div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-200">{difficultyLabel(data.difficulty)}</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300">{data.topic || 'Cơ bản'}</span>
                {data.skillTag ? <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300">{data.skillTag}</span> : null}
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300">TL: {data.timeLimitMs}ms</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300">ML: {data.memoryLimitMB}MB</span>
                {data.estimatedMinutes ? <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300">{data.estimatedMinutes} phút</span> : null}
                {data.pointsReward ? <span className="rounded-full border border-amber-300/20 bg-amber-400/10 px-3 py-1 text-amber-200">+{data.pointsReward} XP</span> : null}
              </div>
            </div>
            <Link to={submitHref}><Button>Bắt đầu nộp bài</Button></Link>
          </div>

          {(data.inputFormat || data.outputFormat || data.constraintsText || data.hintText) ? (
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {data.inputFormat ? <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><div className="text-xs uppercase tracking-wide text-slate-500">Input</div><div className="mt-2 text-sm text-slate-200">{data.inputFormat}</div></div> : null}
              {data.outputFormat ? <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><div className="text-xs uppercase tracking-wide text-slate-500">Output</div><div className="mt-2 text-sm text-slate-200">{data.outputFormat}</div></div> : null}
              {data.constraintsText ? <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><div className="text-xs uppercase tracking-wide text-slate-500">Ràng buộc</div><div className="mt-2 text-sm text-slate-200">{data.constraintsText}</div></div> : null}
              {data.hintText ? <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><div className="text-xs uppercase tracking-wide text-slate-500">Gợi ý</div><div className="mt-2 text-sm text-slate-200">{data.hintText}</div></div> : null}
            </div>
          ) : null}

          <div className="mt-6 prose prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => <h1 className="text-xl font-extrabold">{children}</h1>,
                h2: ({ children }) => <h2 className="mt-6 text-lg font-bold">{children}</h2>,
                p: ({ children }) => <p className="leading-relaxed text-slate-200">{children}</p>,
                li: ({ children }) => <li className="text-slate-200">{children}</li>,
                code({ inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const codeText = String(children).replace(/\n$/, '');
                  if (inline) return <code className="rounded bg-white/10 px-1.5 py-0.5 text-slate-100" {...props}>{children}</code>;
                  return (
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                      <SyntaxHighlighter language={match?.[1] || 'text'} style={oneDark} customStyle={{ margin: 0, background: 'transparent', padding: '14px 16px' }} wrapLongLines>{codeText}</SyntaxHighlighter>
                    </div>
                  );
                },
              }}
            >
              {statement}
            </ReactMarkdown>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="mb-4 text-lg font-bold text-white">Sample testcase</div>
          <SampleTestCases samples={samples} />
        </GlassCard>
      </div>

      <div className="space-y-4">
        <GlassCard className="p-5">
          <div className="mb-4 text-lg font-bold text-white">Thống kê bài tập</div>
          <div className="grid gap-3">
            <ProblemStatCard label="XP / Điểm tối đa" value={data?.pointsReward ?? overview?.maxScore ?? 100} hint={`${overview?.sampleCount ?? 0} sample · ${overview?.testCaseCount ?? 0} testcase`} />
            <ProblemStatCard label="Tỷ lệ AC" value={`${overview?.acceptanceRate ?? 0}%`} hint={`${overview?.acceptedSubmissions ?? 0} accepted / ${overview?.totalSubmissions ?? 0} lượt nộp`} />
            <ProblemStatCard label="Chưa đúng hoàn toàn" value={`${overview?.partialRate ?? 0}%`} hint={`${overview?.partialSubmissions ?? 0} submission có điểm nhưng chưa AC`} />
            <ProblemStatCard label="Sai hoàn toàn" value={`${overview?.failedRate ?? 0}%`} hint={`${overview?.failedSubmissions ?? 0} submission không qua testcase`} />
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
