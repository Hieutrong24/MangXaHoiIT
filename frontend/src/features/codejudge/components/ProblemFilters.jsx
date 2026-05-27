export default function ProblemFilters({
  filters,
  availableGroups = [],
  availableTypes = [],
  availableTopics = [],
  availableSkillTags = [],
  onChange,
  onSubmit,
  onRandom,
}) {
  return (
    <div className="space-y-4">
      <div>
        <input
          value={filters.keyword}
          onChange={(e) => onChange('keyword', e.target.value)}
          placeholder="Tìm bài, kỹ năng, chủ đề..."
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        <div>
          <div className="mb-1 text-xs uppercase tracking-wide text-slate-400">Mức độ</div>
          <select value={filters.groupName} onChange={(e) => onChange('groupName', e.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-100">
            <option value="">Tất cả</option>
            {availableGroups.map((group) => <option key={group} value={group}>{group}</option>)}
          </select>
        </div>

        <div>
          <div className="mb-1 text-xs uppercase tracking-wide text-slate-400">Dạng bài</div>
          <select value={filters.typeName} onChange={(e) => onChange('typeName', e.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-100">
            <option value="">Tất cả</option>
            {availableTypes.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>

        <div>
          <div className="mb-1 text-xs uppercase tracking-wide text-slate-400">Chủ đề</div>
          <select value={filters.topic} onChange={(e) => onChange('topic', e.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-100">
            <option value="">Tất cả</option>
            {availableTopics.map((topic) => <option key={topic} value={topic}>{topic}</option>)}
          </select>
        </div>

        <div>
          <div className="mb-1 text-xs uppercase tracking-wide text-slate-400">Kỹ năng</div>
          <select value={filters.skillTag} onChange={(e) => onChange('skillTag', e.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-100">
            <option value="">Tất cả</option>
            {availableSkillTags.map((skill) => <option key={skill} value={skill}>{skill}</option>)}
          </select>
        </div>

        <div>
          <div className="mb-1 text-xs uppercase tracking-wide text-slate-400">Trạng thái của bạn</div>
          <select value={filters.userStatus} onChange={(e) => onChange('userStatus', e.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-100">
            <option value="">Tất cả</option>
            <option value="Đã AC">Đã AC</option>
            <option value="Đã thử">Đã thử</option>
            <option value="Chưa thử">Chưa thử</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="mb-1 text-xs uppercase tracking-wide text-slate-400">Điểm từ</div>
            <input type="number" min="0" value={filters.minScore} onChange={(e) => onChange('minScore', e.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-100" />
          </div>
          <div>
            <div className="mb-1 text-xs uppercase tracking-wide text-slate-400">Đến</div>
            <input type="number" min="0" value={filters.maxScore} onChange={(e) => onChange('maxScore', e.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-100" />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onSubmit} className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-400 to-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 shadow-[0_14px_30px_rgba(52,211,153,0.18)]">Áp dụng</button>
        <button type="button" onClick={onRandom} className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100">Ngẫu nhiên</button>
      </div>
    </div>
  );
}
