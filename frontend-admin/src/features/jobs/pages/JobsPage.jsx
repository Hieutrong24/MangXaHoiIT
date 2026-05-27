import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { jobsAdminApi } from '../api/jobs.api';
import { pickMessage, toArray } from '../../../shared/utils/api';
import { formatDate, formatNumber } from '../../../shared/utils/format';
import PageHeader from '../../../shared/components/PageHeader.jsx';
import LoadingState from '../../../shared/components/LoadingState.jsx';
import EmptyState from '../../../shared/components/EmptyState.jsx';
import StatusBadge from '../../../shared/components/StatusBadge.jsx';
import StatCard from '../../../shared/components/StatCard.jsx';
import AppIcon from '../../../shared/components/AppIcon.jsx';

function normalizeJob(item) {
  return {
    id: item?.id || item?.jobId,
    title: item?.title || item?.name || '-',
    company: item?.company || item?.companyName || '-',
    location: item?.location || '-',
    employmentType: item?.employmentType || item?.type || '-',
    status: item?.status || (item?.isPublished ? 'published' : 'draft'),
    deadline: item?.deadline || item?.expiresAt || '-',
    applicationCount: item?.applicationCount || item?.applications || 0,
  };
}

export default function JobsPage() {
  const [filters, setFilters] = useState({ keyword: '', page: 1, pageSize: 20 });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await jobsAdminApi.list(filters);
      setItems(toArray(data).map(normalizeJob));
    } catch (error) {
      setError(pickMessage(error));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filters.page, filters.pageSize]);

  async function removeJob(job) {
    if (!window.confirm(`Xóa job ${job.title}?`)) return;
    try {
      await jobsAdminApi.remove(job.id);
      await load();
    } catch (error) {
      setError(pickMessage(error));
    }
  }

  const stats = useMemo(() => ({
    total: items.length,
    published: items.filter((item) => item.status === 'published').length,
    open: items.filter((item) => item.status === 'published' || item.status === 'active').length,
  }), [items]);

  return (
    <div className="stack-lg">
      <PageHeader title="Quản trị tuyển dụng" subtitle="Tạo tin tuyển dụng mới, theo dõi trạng thái công bố và truy cập nhanh sang danh sách ứng tuyển." icon="jobs" actionLabel="Tạo tin mới" actionTo="/jobs/new" />
      <div className="stats-grid stats-grid-tight compact-stat-grid">
        <StatCard label="Tổng việc làm" value={stats.total} icon="jobs" tone="info" />
        <StatCard label="Đã công bố" value={stats.published} icon="dashboard" tone="success" />
        <StatCard label="Đang mở" value={stats.open} icon="spark" tone="violet" />
      </div>
      <div className="card section-card">
        <form className="toolbar toolbar-rich" onSubmit={(e) => { e.preventDefault(); load(); }}>
          <div className="input-with-icon grow-2"><AppIcon name="search" size={16} /><input placeholder="Tìm theo tiêu đề, công ty hoặc địa điểm" value={filters.keyword} onChange={(e) => setFilters((prev) => ({ ...prev, keyword: e.target.value }))} /></div>
          <select value={filters.pageSize} onChange={(e) => setFilters((prev) => ({ ...prev, pageSize: Number(e.target.value), page: 1 }))}>
            <option value={10}>10 / trang</option>
            <option value={20}>20 / trang</option>
            <option value={50}>50 / trang</option>
          </select>
          <button className="btn btn-primary"><AppIcon name="refresh" size={16} />Tải lại</button>
        </form>
      </div>
      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <LoadingState label="Đang tải danh sách job..." /> : null}
      {!loading && items.length === 0 ? <EmptyState title="Không có job nào" description="API chưa trả về job phù hợp với điều kiện lọc hiện tại." /> : null}
      {!loading && items.length > 0 ? (
        <div className="card section-card table-wrap">
          <div className="section-title-row">
            <div>
              <div className="eyebrow">Danh sách việc làm</div>
              <h3>Kho tin tuyển dụng</h3>
            </div>
            <div className="meta-chip">{formatNumber(items.length)} bản ghi</div>
          </div>
          <table className="table admin-table">
            <thead>
              <tr>
                <th>Vị trí</th>
                <th>Địa điểm</th>
                <th>Loại</th>
                <th>Trạng thái</th>
                <th>Hạn</th>
                <th>Tác vụ</th>
              </tr>
            </thead>
            <tbody>
              {items.map((job) => (
                <tr key={job.id}>
                  <td>
                    <div className="stack-xs">
                      <strong>{job.title}</strong>
                      <span className="muted small">{job.company}</span>
                      <span className="tiny code-inline">{job.id}</span>
                    </div>
                  </td>
                  <td>{job.location}</td>
                  <td>{job.employmentType}</td>
                  <td><StatusBadge value={job.status} /></td>
                  <td>{formatDate(job.deadline)}</td>
                  <td>
                    <div className="row-actions">
                      <Link className="btn btn-secondary" to={`/jobs/${job.id}`}><AppIcon name="eye" size={16} />Chi tiết</Link>
                      <Link className="btn btn-secondary" to={`/jobs/${job.id}/edit`}><AppIcon name="pencil" size={16} />Sửa</Link>
                      <Link className="btn btn-secondary" to={`/jobs/${job.id}/applications`}><AppIcon name="users" size={16} />Ứng tuyển</Link>
                      <button className="btn btn-danger" onClick={() => removeJob(job)}><AppIcon name="trash" size={16} />Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="table-footer">
            <button className="btn btn-secondary" disabled={filters.page <= 1} onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}>Trang trước</button>
            <div className="muted small">Trang hiện tại: {filters.page}</div>
            <button className="btn btn-secondary" disabled={items.length < filters.pageSize} onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}>Trang sau</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
