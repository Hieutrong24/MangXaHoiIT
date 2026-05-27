import { Link } from 'react-router-dom';

export default function FeaturedProblems({ items = [] }) {
  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">Chưa có bài nổi bật.</div>
      ) : (
        items.map((item) => (
          <Link key={item.problemId} to={`/code/problems/${item.problemId}`} className="block rounded-3xl border border-white/10 bg-white/5 px-4 py-4 transition hover:bg-white/10">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-emerald-200">{item.problemCode}</div>
                <div className="mt-1 line-clamp-2 text-sm text-slate-100">{item.title}</div>
              </div>
              <div className="rounded-full bg-amber-400/15 px-3 py-1 text-xs font-semibold text-amber-200">+{item.pointsReward ?? item.maxScore} XP</div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
              <span>{item.topic || item.groupName}</span>
              <span>•</span>
              <span>{item.acceptanceRate}% AC</span>
              <span>•</span>
              <span>{item.acceptedCount} lượt AC</span>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
