// src/features/codejudge/pages/ProblemsPage.jsx
import { useEffect, useState } from "react";
import GlassCard from "../../../shared/components/GlassCard";
import { Link } from "react-router-dom";
import { Code2 } from "lucide-react";
import { codejudgeApi } from "../api/codejudge.api";

export default function ProblemsPage() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await codejudgeApi.listProblems();
        const items = res?.data ?? res;
        setProblems(items || []);
      } catch (err) {
        console.error("Load problems failed", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="grid gap-4">
      <GlassCard className="p-6">
        <div className="flex items-center gap-2">
          <Code2 className="h-5 w-5 text-cyan-300" />
          <div className="text-xl font-extrabold tracking-tight">Luyện code</div>
        </div>

        <div className="mt-4 grid gap-2">
          {problems.map((p) => (
            <Link
              key={p.problemId}
              to={`/code/problems/${p.problemId}`}
              className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition p-4"
            >
              <div className="font-extrabold">{p.title}</div>
              <div className="text-xs text-slate-400 mt-1">#{p.slug}</div>
            </Link>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}