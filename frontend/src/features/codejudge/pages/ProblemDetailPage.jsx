// src/features/codejudge/pages/ProblemDetailPage.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import GlassCard from "../../../shared/components/GlassCard";
import Button from "../../../shared/components/Button";
import { codejudgeApi } from "../api/codejudge.api";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

function difficultyLabel(d) {
  if (d <= 1) return "Easy";
  if (d === 2) return "Medium";
  if (d === 3) return "Hard";
  return "Advanced";
}

export default function ProblemDetailPage() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await codejudgeApi.getProblem(id);
        // ✅ nhận cả dạng {data: ...} và dạng trực tiếp
        const p = res?.data ?? res;
        if (alive) setProblem(p);
      } catch (e) {
        console.error("Load problem failed", e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) return <div className="text-slate-300">Loading...</div>;
  if (!problem) return <div className="text-slate-300">Không tìm thấy bài.</div>;

  return (
    <div className="grid gap-4">
      <GlassCard className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-2xl font-black tracking-tight">{problem.title}</div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-slate-200">
                {difficultyLabel(problem.difficulty)}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-slate-300">
                TL: {problem.timeLimitMs}ms
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-slate-300">
                ML: {problem.memoryLimitMB}MB
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-slate-400">
                slug: {problem.slug}
              </span>
            </div>
          </div>

          <Link to={`/code/submit/${problem.problemId}`}>
            <Button>Bắt đầu nộp bài</Button>
          </Link>
        </div>

        <div className="mt-6 prose prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => <h1 className="text-xl font-extrabold">{children}</h1>,
              h2: ({ children }) => <h2 className="text-lg font-bold mt-6">{children}</h2>,
              p: ({ children }) => <p className="text-slate-200 leading-relaxed">{children}</p>,
              li: ({ children }) => <li className="text-slate-200">{children}</li>,
              code({ inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                const codeText = String(children).replace(/\n$/, "");

                if (inline) {
                  return (
                    <code className="rounded bg-white/10 px-1.5 py-0.5 text-slate-100" {...props}>
                      {children}
                    </code>
                  );
                }

                return (
                  <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                    <SyntaxHighlighter
                      language={match?.[1] || "text"}
                      style={oneDark}
                      customStyle={{
                        margin: 0,
                        background: "transparent",
                        padding: "14px 16px",
                      }}
                      wrapLongLines
                    >
                      {codeText}
                    </SyntaxHighlighter>
                  </div>
                );
              },
            }}
          >
            {problem.statement || ""}
          </ReactMarkdown>
        </div>
      </GlassCard>
    </div>
  );
}