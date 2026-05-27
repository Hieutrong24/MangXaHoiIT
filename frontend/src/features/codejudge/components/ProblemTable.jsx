import { Link } from 'react-router-dom';
import ProblemStatusIcon from './ProblemStatusIcon';

export default function ProblemTable({ items = [] }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-white/[0.04] text-left text-slate-200">
            <tr>
              <th className="px-4 py-3 font-semibold">ID</th>
              <th className="px-4 py-3 font-semibold">Bài học</th>
              <th className="px-4 py-3 font-semibold">Chủ đề</th>
              <th className="px-4 py-3 font-semibold">XP</th>
              <th className="px-4 py-3 font-semibold">% AC</th>
              <th className="px-4 py-3 font-semibold">Kỹ năng</th>
              <th className="px-4 py-3 font-semibold text-center">✓</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">Không có bài phù hợp.</td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.problemId} className="border-t border-white/5 text-slate-200">
                  <td className="px-4 py-3 align-top font-semibold text-emerald-300">
                    <Link to={`/code/problems/${item.problemId}`} className="hover:underline">{item.problemCode}</Link>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="font-medium text-slate-100">{item.title}</div>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                      <span>{item.groupName}</span>
                      <span>•</span>
                      <span>{item.typeName}</span>
                      {item.estimatedMinutes ? <><span>•</span><span>{item.estimatedMinutes} phút</span></> : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">{item.topic || 'Cơ bản'}</td>
                  <td className="px-4 py-3 align-top font-semibold text-amber-300">{item.pointsReward ?? item.maxScore}</td>
                  <td className="px-4 py-3 align-top">{item.acceptanceRate}%</td>
                  <td className="px-4 py-3 align-top text-sky-200">{item.skillTag || 'General'}</td>
                  <td className="px-4 py-3 align-top text-center"><ProblemStatusIcon status={item.userStatus} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
