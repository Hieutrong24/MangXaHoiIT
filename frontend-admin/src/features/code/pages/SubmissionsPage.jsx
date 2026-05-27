import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { codeAdminApi } from '../api/code.api';
import { pickMessage, toArray } from '../../../shared/utils/api';
import { formatDateTime, formatNumber } from '../../../shared/utils/format';
import PageHeader from '../../../shared/components/PageHeader.jsx';
import LoadingState from '../../../shared/components/LoadingState.jsx';
import EmptyState from '../../../shared/components/EmptyState.jsx';
import StatusBadge from '../../../shared/components/StatusBadge.jsx';
import StatCard from '../../../shared/components/StatCard.jsx';
import AppIcon from '../../../shared/components/AppIcon.jsx';
import { ProgressColumns, SparklineCard } from '../../../shared/components/TrendCharts.jsx';

export default function SubmissionsPage() {
  const [filters, setFilters] = useState({ problemId: '', userId: '', status: '', language: '', page: 1, pageSize: 30 });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await codeAdminApi.listSubmissions(filters);
      setItems(toArray(data));
    } catch (error) {
      setError(pickMessage(error));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filters.page, filters.pageSize]);

  async function rejudge(id) {
    setBusyId(id);
    try {
      await codeAdminApi.rejudge(id);
      await load();
    } catch (error) {
      setError(pickMessage(error));
    } finally {
      setBusyId('');
    }
  }

  async function cancel(id) {
    setBusyId(id);
    try {
      await codeAdminApi.cancel(id);
      await load();
    } catch (error) {
      setError(pickMessage(error));
    } finally {
      setBusyId('');
    }
  }

  const stats = useMemo(() => ({
    total: items.length,
    accepted: items.filter((item) => String(item.status || item.verdict || '').toLowerCase() === 'accepted').length,
    queued: items.filter((item) => String(item.status || item.verdict || '').toLowerCase() === 'queued').length,
  }), [items]);

  return (
    <div className="stack-lg">
      <PageHeader title="Theo dõi bài nộp" subtitle="Giám sát hàng chấm bài và can thiệp nhanh với các tác vụ chấm lại hoặc hủy." icon="submissions" />
      <div className="stats-grid content-summary-grid compact-stat-grid">
        <StatCard label="Tổng bài nộp" value={stats.total} icon="submissions" tone="info" />
        <StatCard label="Đã chấp nhận" value={stats.accepted} icon="spark" tone="success" />
        <StatCard label="Đang chờ" value={stats.queued} icon="activity" tone="warning" />
        <StatCard label="Tỷ lệ thành công" value={`${stats.total ? Math.round((stats.accepted / stats.total) * 100) : 0}%`} icon="dashboard" tone="violet" />
      </div>

      <div className="dashboard-grid">
        <SparklineCard title="Lượt chấp nhận" value={stats.accepted} delta="Chấm bài" points={[2, 4, 6, 7, 8, 9, stats.accepted || 1]} />
        <div className="card section-card"><div className="section-title-row"><div><div className="eyebrow">Cơ cấu bài nộp</div><h3>Phân bố trạng thái</h3></div></div><ProgressColumns items={[{ label: 'Đã chấp nhận', value: stats.accepted }, { label: 'Đang chờ', value: stats.queued }, { label: 'Khác', value: Math.max(stats.total - stats.accepted - stats.queued, 0) }]} /></div>
      </div>
      <div className="card section-card">
        <form className="toolbar toolbar-rich" onSubmit={(e) => { e.preventDefault(); load(); }}>
          <div className="input-with-icon"><AppIcon name="code" size={16} /><input placeholder="Mã bài tập" value={filters.problemId} onChange={(e) => setFilters((prev) => ({ ...prev, problemId: e.target.value }))} /></div>
          <div className="input-with-icon"><AppIcon name="users" size={16} /><input placeholder="Mã người dùng" value={filters.userId} onChange={(e) => setFilters((prev) => ({ ...prev, userId: e.target.value }))} /></div>
          <input placeholder="Trạng thái" value={filters.status} onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))} />
          <input placeholder="Ngôn ngữ" value={filters.language} onChange={(e) => setFilters((prev) => ({ ...prev, language: e.target.value }))} />
          <button className="btn btn-primary"><AppIcon name="refresh" size={16} />Tải lại</button>
        </form>
      </div>
      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <LoadingState label="Đang tải bài nộp..." /> : null}
      {!loading && items.length === 0 ? <EmptyState title="Không có bài nộp" description="Hàng chấm bài hiện không có bản ghi phù hợp với bộ lọc." /> : null}
      {!loading && items.length > 0 ? (
        <div className="card section-card table-wrap">
          <div className="section-title-row">
            <div><div className="eyebrow">Hàng chờ bài nộp</div><h3>Bài nộp gần đây</h3></div>
            <div className="meta-chip">{formatNumber(items.length)} bản ghi</div>
          </div>
          <table className="table admin-table">
            <thead>
              <tr>
                <th>Bài nộp</th>
                <th>Người dùng</th>
                <th>Bài tập</th>
                <th>Ngôn ngữ</th>
                <th>Trạng thái</th>
                <th>Điểm</th>
                <th>Tác vụ</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const id = item.id || item.submissionId || index;
                return (
                  <tr key={id}>
                    <td>
                      <div className="stack-xs">
                        <strong>{id}</strong>
                        <span className="tiny muted">{formatDateTime(item.createdAt || item.submittedAt)}</span>
                      </div>
                    </td>
                    <td>{item.userId || item.accountId || '-'}</td>
                    <td>{item.problemId || '-'}</td>
                    <td>{item.language || item.languageCode || '-'}</td>
                    <td><StatusBadge value={item.status || item.verdict || '-'} /></td>
                    <td>{item.score ?? '-'}</td>
                    <td>
                      <div className="row-actions">
                        <Link className="btn btn-secondary" to={`/code/submissions/${id}`}><AppIcon name="eye" size={16} />Chi tiết</Link>
                        <button className="btn btn-warning" disabled={busyId === id} onClick={() => rejudge(id)}><AppIcon name="refresh" size={16} />Chấm lại</button>
                        <button className="btn btn-danger" disabled={busyId === id} onClick={() => cancel(id)}><AppIcon name="trash" size={16} />Hủy</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
