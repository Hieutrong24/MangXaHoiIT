import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpenCheck, Search, Swords } from 'lucide-react';
import GlassCard from '../../../shared/components/GlassCard';
import { codejudgeApi } from '../api/codejudge.api';
import ProblemTable from '../components/ProblemTable';
import ProblemPagination from '../components/ProblemPagination';
import ProblemFilters from '../components/ProblemFilters';
import FeaturedProblems from '../components/FeaturedProblems';

const DEFAULT_FILTERS = {
  keyword: '',
  groupName: '',
  typeName: '',
  topic: '',
  skillTag: '',
  userStatus: '',
  minScore: '0',
  maxScore: '100',
  page: 1,
  pageSize: 20,
};

export default function ProblemsPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [response, setResponse] = useState({ items: [], page: 1, totalPages: 0, totalItems: 0, availableGroups: [], availableTypes: [], availableTopics: [], availableSkillTags: [] });
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  const requestParams = useMemo(() => ({
    keyword: filters.keyword || undefined,
    group: filters.groupName || undefined,
    type: filters.typeName || undefined,
    topic: filters.topic || undefined,
    skillTag: filters.skillTag || undefined,
    userStatus: filters.userStatus || undefined,
    minScore: Number(filters.minScore || 0) || undefined,
    maxScore: Number(filters.maxScore || 0) || undefined,
    page: filters.page,
    pageSize: filters.pageSize,
    sortBy: 'accepted',
    sortDir: 'desc',
  }), [filters]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const [listRes, featuredRes] = await Promise.all([
          codejudgeApi.listProblemsOj(requestParams),
          codejudgeApi.listFeaturedProblems({ limit: 6 }),
        ]);
        if (!active) return;
        setResponse(listRes || { items: [] });
        setFeatured(Array.isArray(featuredRes) ? featuredRes : featuredRes?.items || []);
      } catch (error) {
        console.error('Load OJ problems failed', error);
        if (active) {
          setResponse({ items: [], page: 1, totalPages: 0, totalItems: 0, availableGroups: [], availableTypes: [], availableTopics: [], availableSkillTags: [] });
          setFeatured([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [requestParams]);

  const handleFilterChange = (key, value) => setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  const handleRandom = () => {
    const source = response.items?.length ? response.items : featured;
    if (!source?.length) return;
    const randomItem = source[Math.floor(Math.random() * source.length)];
    navigate(`/code/problems/${randomItem.problemId}`);
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-4">
        <GlassCard className="overflow-hidden p-0">
          <div className="bg-[radial-gradient(80%_120%_at_20%_0%,rgba(52,211,153,0.18),transparent_70%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(15,23,42,0.72))] p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">
                  <BookOpenCheck className="h-4 w-4" /> Bài luyện theo chủ đề
                </div>
                <div className="mt-4 text-3xl font-black tracking-tight text-white">Kho thử thách code theo kiểu học từng bước</div>
                <div className="mt-2 text-sm text-slate-300">Luyện riêng từng kỹ năng, nhận XP, rồi quay lại lộ trình học chính khi đã sẵn sàng.</div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link to="/code/learn" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 to-sky-400 px-5 py-3 text-sm font-semibold text-slate-950">
                    <BookOpenCheck className="h-4 w-4" /> Về hành trình học
                  </Link>
                  <button type="button" onClick={handleRandom} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white">
                    <Swords className="h-4 w-4" /> Chọn thử thách ngẫu nhiên
                  </button>
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-right">
                <div className="text-xs uppercase tracking-wide text-slate-400">Tổng bài</div>
                <div className="text-3xl font-black text-white">{response.totalItems || 0}</div>
                <div className="mt-1 text-xs text-slate-400">Trang {response.page || 1}/{response.totalPages || 1}</div>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-slate-200"><Search className="h-4 w-4 text-emerald-300" /><div className="text-sm font-semibold">Danh sách thử thách</div></div>
            <div className="text-xs text-slate-500">Từ dễ đến khó, có thể làm riêng ngoài path</div>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-8 text-center text-slate-400">Đang tải dữ liệu bài tập...</div>
          ) : (
            <>
              <ProblemTable items={response.items || []} />
              <div className="mt-4 flex justify-center">
                <ProblemPagination page={response.page || 1} totalPages={response.totalPages || 0} onChange={(page) => setFilters((prev) => ({ ...prev, page }))} />
              </div>
            </>
          )}
        </GlassCard>
      </div>

      <div className="space-y-4">
        <GlassCard className="p-5">
          <div className="mb-4 text-lg font-bold text-white">Bộ lọc bài học</div>
          <ProblemFilters
            filters={filters}
            availableGroups={response.availableGroups || []}
            availableTypes={response.availableTypes || []}
            availableTopics={response.availableTopics || []}
            availableSkillTags={response.availableSkillTags || []}
            onChange={handleFilterChange}
            onSubmit={() => setFilters((prev) => ({ ...prev, page: 1 }))}
            onRandom={handleRandom}
          />
        </GlassCard>

        <GlassCard className="p-5">
          <div className="mb-4 text-lg font-bold text-white">Thử thách nổi bật</div>
          <FeaturedProblems items={featured} />
        </GlassCard>
      </div>
    </div>
  );
}
