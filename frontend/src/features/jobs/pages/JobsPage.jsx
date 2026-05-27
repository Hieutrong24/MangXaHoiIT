import { useEffect, useState } from "react";
import { MapPin, Search, BriefcaseBusiness, Building2, ArrowUpRight } from "lucide-react";
import GlassCard from "../../../shared/components/GlassCard";
import { jobsApi } from "../api/jobs.api";

export default function JobsPage() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  async function load(keyword = '') {
    setLoading(true);
    try {
      const data = await jobsApi.list({ limit: 24, q: keyword });
      setItems(Array.isArray(data?.items) ? data.items : []);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(''); }, []);

  return (
    <div className="space-y-4">
      <GlassCard className="p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Công việc IT Việt Nam</div>
            <h1 className="mt-2 text-3xl font-black text-white">Khám phá tuyển dụng IT từ các nguồn phổ biến tại Việt Nam</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-300">Tập trung vào frontend, backend, mobile, data, QA, DevOps và intern/fresher để sinh viên dễ theo dõi thị trường.</p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-2">
            <Search className="h-4 w-4 text-slate-500" />
            <input className="w-64 bg-transparent text-sm text-white outline-none placeholder:text-slate-500" placeholder="Tìm theo vị trí hoặc công ty" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load(q)} />
          </div>
        </div>
      </GlassCard>
      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {(loading ? Array.from({ length: 6 }, (_, i) => ({ id: i, title: 'Đang tải...', source: '...' })) : items).map((job) => (
          <GlassCard key={job.id} className="flex h-full flex-col p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-extrabold text-white">{job.title}</div>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {job.company || job.source}</span>
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.location || 'Vietnam'}</span>
                  <span className="inline-flex items-center gap-1"><BriefcaseBusiness className="h-3.5 w-3.5" /> {job.source}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 text-sm text-slate-300">{job.salaryRange || 'Mức lương xem chi tiết tại trang nguồn.'}</div>
            <div className="mt-auto pt-5">
              <a href={job.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 hover:text-emerald-200">Xem tuyển dụng <ArrowUpRight className="h-4 w-4" /></a>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
