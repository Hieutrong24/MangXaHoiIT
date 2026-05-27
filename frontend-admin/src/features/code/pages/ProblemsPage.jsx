import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { codeAdminApi } from '../api/code.api';
import { pickMessage, toArray } from '../../../shared/utils/api';
import { formatNumber, normalizeListField } from '../../../shared/utils/format';
import PageHeader from '../../../shared/components/PageHeader.jsx';
import LoadingState from '../../../shared/components/LoadingState.jsx';
import EmptyState from '../../../shared/components/EmptyState.jsx';
import StatusBadge from '../../../shared/components/StatusBadge.jsx';
import StatCard from '../../../shared/components/StatCard.jsx';
import AppIcon from '../../../shared/components/AppIcon.jsx';
import { ProgressColumns, SparklineCard } from '../../../shared/components/TrendCharts.jsx';

function normalizeProblem(item) {
  return {
    id: item?.id || item?.problemId,
    title: item?.title || '-',
    difficulty: item?.difficulty || '-',
    status: item?.status || (item?.isPublished ? 'published' : 'draft'),
    slug: item?.slug || '-',
    tags: Array.isArray(item?.tags) ? item.tags : normalizeListField(item?.tags),
  };
}

function getDifficultyKey(difficulty) {
  const value = String(difficulty || '').toLowerCase();
  if (value.includes('easy') || value.includes('dễ')) return 'easy';
  if (value.includes('hard') || value.includes('khó')) return 'hard';
  if (value.includes('medium') || value.includes('trung')) return 'medium';
  return 'unknown';
}

function getDifficultyLabel(difficulty) {
  const key = getDifficultyKey(difficulty);
  if (key === 'easy') return 'Dễ';
  if (key === 'medium') return 'Trung bình';
  if (key === 'hard') return 'Khó';
  return difficulty || '-';
}

function ProblemKpiCard({ label, value, icon, tone }) {
  return (
    <article className={`problem-kpi-card tone-${tone}`}>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <i><AppIcon name={icon} size={23} /></i>
    </article>
  );
}

function ProblemSparkline({ total }) {
  return (
    <article className="problem-overview-card">
      <div className="problem-card-heading">
        <div>
          <h2>Kho bài tập</h2>
          <p>Tăng trưởng nội dung 30 ngày qua</p>
        </div>
        <strong>{formatNumber(total)}</strong>
      </div>
      <svg className="problem-sparkline" viewBox="0 0 400 108" preserveAspectRatio="none" role="img" aria-label="Tăng trưởng kho bài tập">
        <path d="M0,86 Q50,78 100,64 T200,43 T300,53 T400,22 L400,108 L0,108 Z" />
        <path d="M0,86 Q50,78 100,64 T200,43 T300,53 T400,22" />
      </svg>
    </article>
  );
}

function DifficultyDistribution({ stats }) {
  const medium = Math.max(stats.total - stats.easy - stats.hard, 0);
  const max = Math.max(stats.easy, medium, stats.hard, 1);
  const items = [
    { label: 'Dễ', value: stats.easy, tone: 'easy' },
    { label: 'Trung bình', value: medium, tone: 'medium' },
    { label: 'Khó', value: stats.hard, tone: 'hard' },
  ];

  return (
    <article className="problem-overview-card">
      <h2>Phân bố độ khó</h2>
      <div className="problem-difficulty-bars">
        {items.map((item) => (
          <div className={`problem-difficulty-bar tone-${item.tone}`} key={item.label}>
            <strong>{formatNumber(item.value)}</strong>
            <i style={{ height: `${Math.max((item.value / max) * 100, item.value ? 8 : 3)}%` }} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

export default function ProblemsPage() {
  const [filters, setFilters] = useState({ keyword: '', difficulty: '', page: 1, pageSize: 20 });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load(requestFilters = filters) {
    setLoading(true);
    setError('');
    try {
      const data = await codeAdminApi.listProblems(requestFilters);
      setItems(toArray(data).map(normalizeProblem));
    } catch (error) {
      setError(pickMessage(error));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filters.page, filters.pageSize]);

  async function removeProblem(problem) {
    if (!window.confirm(`Xóa bài tập ${problem.title}?`)) return;
    try {
      await codeAdminApi.removeProblem(problem.id);
      await load();
    } catch (error) {
      setError(pickMessage(error));
    }
  }

  const stats = useMemo(() => ({
    total: items.length,
    easy: items.filter((item) => getDifficultyKey(item.difficulty) === 'easy').length,
    hard: items.filter((item) => getDifficultyKey(item.difficulty) === 'hard').length,
  }), [items]);
  const coverage = stats.total ? Math.round(((stats.easy + stats.hard) / stats.total) * 100) : 0;
  const pageStart = items.length ? ((filters.page - 1) * filters.pageSize) + 1 : 0;
  const pageEnd = items.length ? pageStart + items.length - 1 : 0;

  return (
    <main className="code-problems-page">
      <header className="code-problems-hero">
        <div>
          <h1>Quản trị bài tập code</h1>
          <p>Điều phối kho đề, testcase và cấu hình nội dung cho code judge.</p>
        </div>
        <Link className="code-problems-primary" to="/code/problems/new">
          <AppIcon name="plus" size={18} />
          Thêm bài tập
        </Link>
      </header>

      <section className="problem-kpi-grid" aria-label="Chỉ số bài tập code">
        <ProblemKpiCard label="Tổng bài" value={formatNumber(stats.total)} icon="code" tone="primary" />
        <ProblemKpiCard label="Dễ" value={formatNumber(stats.easy)} icon="spark" tone="success" />
        <ProblemKpiCard label="Khó" value={formatNumber(stats.hard)} icon="activity" tone="danger" />
        <ProblemKpiCard label="Độ phủ" value={`${coverage}%`} icon="dashboard" tone="tertiary" />
      </section>

      <section className="problem-overview-grid">
        <ProblemSparkline total={stats.total} />
        <DifficultyDistribution stats={stats} />
      </section>

      <section className="problem-filter-card">
        <form
          className="problem-filter-form"
          onSubmit={(event) => {
            event.preventDefault();
            const nextFilters = { ...filters, page: 1 };
            setFilters(nextFilters);
            load(nextFilters);
          }}
        >
          <label className="problem-search-field">
            <AppIcon name="search" size={17} />
            <input
              placeholder="Tìm theo tiêu đề hoặc slug"
              value={filters.keyword}
              onChange={(event) => setFilters((prev) => ({ ...prev, keyword: event.target.value }))}
            />
          </label>
          <select value={filters.difficulty} onChange={(event) => setFilters((prev) => ({ ...prev, difficulty: event.target.value, page: 1 }))}>
            <option value="">Tất cả độ khó</option>
            <option value="easy">Dễ</option>
            <option value="medium">Trung bình</option>
            <option value="hard">Khó</option>
          </select>
          <button type="submit">
            <AppIcon name="refresh" size={17} />
            Tải lại
          </button>
        </form>
      </section>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <LoadingState label="Đang tải bài tập..." /> : null}
      {!loading && items.length === 0 ? <EmptyState title="Không có bài tập" description="Kho bài tập hiện chưa có dữ liệu phù hợp với bộ lọc." /> : null}

      {!loading && items.length > 0 ? (
        <section className="problem-table-card">
          <div className="problem-table-heading">
            <div>
              <span>Kho bài</span>
              <h2>Danh sách bài tập</h2>
            </div>
            <div className="problem-table-count">{formatNumber(items.length)} bản ghi</div>
          </div>
          <div className="problem-table-scroll">
            <table className="problem-table">
              <thead>
                <tr>
                  <th>Bài tập</th>
                  <th>Độ khó</th>
                  <th>Slug</th>
                  <th>Tags</th>
                  <th>Trạng thái</th>
                  <th>Tác vụ</th>
                </tr>
              </thead>
              <tbody>
                {items.map((problem) => {
                  const difficultyKey = getDifficultyKey(problem.difficulty);
                  return (
                    <tr key={problem.id}>
                      <td>
                        <div className="problem-title-cell">
                          <i><AppIcon name="code" size={18} /></i>
                          <div>
                            <strong>{problem.title}</strong>
                            <small>#{problem.id || 'PROBLEM'}</small>
                          </div>
                        </div>
                      </td>
                      <td><span className={`problem-difficulty-pill tone-${difficultyKey}`}>{getDifficultyLabel(problem.difficulty)}</span></td>
                      <td><code>{problem.slug}</code></td>
                      <td>
                        <div className="problem-tag-list">
                          {problem.tags.length ? problem.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>) : <em>-</em>}
                        </div>
                      </td>
                      <td><StatusBadge value={problem.status} /></td>
                      <td>
                        <div className="problem-actions">
                          <Link className="problem-action-button tone-primary" to={`/code/problems/${problem.id}`} title="Xem">
                            <AppIcon name="eye" size={18} />
                          </Link>
                          <Link className="problem-action-button tone-tertiary" to={`/code/problems/${problem.id}/edit`} title="Sửa">
                            <AppIcon name="pencil" size={18} />
                          </Link>
                          <button className="problem-action-button tone-danger" type="button" onClick={() => removeProblem(problem)} title="Xóa">
                            <AppIcon name="trash" size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <footer className="problem-table-footer">
            <span>Hiển thị {pageStart} - {pageEnd} trên tổng số {formatNumber(stats.total)} bài tập</span>
            <nav aria-label="Phân trang bài tập">
              <button type="button" disabled={filters.page <= 1} onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}>
                <AppIcon name="chevronRight" size={16} className="problem-icon-left" />
              </button>
              <b>{filters.page}</b>
              <button type="button" disabled={items.length < filters.pageSize} onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}>
                <AppIcon name="chevronRight" size={16} />
              </button>
            </nav>
          </footer>
        </section>
      ) : null}
    </main>
  );

  return (
    <div className="stack-lg">
      <PageHeader title="Quản trị bài tập code" subtitle="Điều phối kho đề, testcase và cấu hình nội dung cho code judge." icon="code" actionLabel="Thêm bài tập" actionTo="/code/problems/new" />
      <div className="stats-grid content-summary-grid compact-stat-grid">
        <StatCard label="Tổng bài" value={stats.total} icon="code" tone="info" />
        <StatCard label="Dễ" value={stats.easy} icon="spark" tone="success" />
        <StatCard label="Khó" value={stats.hard} icon="activity" tone="warning" />
        <StatCard label="Độ phủ" value={`${stats.total ? Math.round(((stats.easy + stats.hard) / stats.total) * 100) : 0}%`} icon="dashboard" tone="violet" />
      </div>

      <div className="dashboard-grid">
        <SparklineCard title="Kho bài tập" value={stats.total} delta="Danh mục" points={[3, 5, 7, 8, 10, 12, stats.total || 1]} />
        <div className="card section-card"><div className="section-title-row"><div><div className="eyebrow">Độ khó</div><h3>Phân bố độ khó</h3></div></div><ProgressColumns items={[{ label: 'Dễ', value: stats.easy }, { label: 'Trung bình', value: stats.total - stats.easy - stats.hard }, { label: 'Khó', value: stats.hard }]} /></div>
      </div>
      <div className="card section-card">
        <form className="toolbar toolbar-rich" onSubmit={(e) => { e.preventDefault(); load(); }}>
          <div className="input-with-icon grow-2"><AppIcon name="search" size={16} /><input placeholder="Tìm theo tiêu đề hoặc slug" value={filters.keyword} onChange={(e) => setFilters((prev) => ({ ...prev, keyword: e.target.value }))} /></div>
          <select value={filters.difficulty} onChange={(e) => setFilters((prev) => ({ ...prev, difficulty: e.target.value }))}>
            <option value="">Tất cả độ khó</option>
            <option value="easy">Dễ</option>
            <option value="medium">Trung bình</option>
            <option value="hard">Khó</option>
          </select>
          <button className="btn btn-primary"><AppIcon name="refresh" size={16} />Tải lại</button>
        </form>
      </div>
      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <LoadingState label="Đang tải bài tập..." /> : null}
      {!loading && items.length === 0 ? <EmptyState title="Không có bài tập" description="Kho bài tập hiện chưa có dữ liệu phù hợp với bộ lọc." /> : null}
      {!loading && items.length > 0 ? (
        <div className="card section-card table-wrap">
          <div className="section-title-row">
            <div><div className="eyebrow">Kho bài</div><h3>Danh sách bài tập</h3></div>
            <div className="meta-chip">{formatNumber(items.length)} bản ghi</div>
          </div>
          <table className="table admin-table">
            <thead>
              <tr>
                <th>Bài tập</th>
                <th>Độ khó</th>
                <th>Slug</th>
                <th>Tags</th>
                <th>Trạng thái</th>
                <th>Tác vụ</th>
              </tr>
            </thead>
            <tbody>
              {items.map((problem) => (
                <tr key={problem.id}>
                  <td>
                    <div className="stack-xs">
                      <strong>{problem.title}</strong>
                      <span className="tiny code-inline">{problem.id}</span>
                    </div>
                  </td>
                  <td>{problem.difficulty}</td>
                  <td>{problem.slug}</td>
                  <td><div className="tag-list">{problem.tags.length ? problem.tags.map((tag) => <span key={tag} className="tag">{tag}</span>) : <span className="muted small">-</span>}</div></td>
                  <td><StatusBadge value={problem.status} /></td>
                  <td>
                    <div className="row-actions">
                      <Link className="btn btn-secondary" to={`/code/problems/${problem.id}`}><AppIcon name="eye" size={16} />Chi tiết</Link>
                      <Link className="btn btn-secondary" to={`/code/problems/${problem.id}/edit`}><AppIcon name="pencil" size={16} />Sửa</Link>
                      <button className="btn btn-danger" onClick={() => removeProblem(problem)}><AppIcon name="trash" size={16} />Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
