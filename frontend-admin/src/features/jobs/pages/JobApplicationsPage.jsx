import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { jobsAdminApi } from '../api/jobs.api';
import { pickMessage, toArray } from '../../../shared/utils/api';
import { formatNumber } from '../../../shared/utils/format';
import PageHeader from '../../../shared/components/PageHeader.jsx';
import LoadingState from '../../../shared/components/LoadingState.jsx';
import EmptyState from '../../../shared/components/EmptyState.jsx';
import StatusBadge from '../../../shared/components/StatusBadge.jsx';
import StatCard from '../../../shared/components/StatCard.jsx';

const statusOptions = ['submitted', 'reviewing', 'shortlisted', 'rejected', 'hired'];

export default function JobApplicationsPage() {
  const { jobId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);
  const [busyId, setBusyId] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = jobId ? await jobsAdminApi.applicationsByJob(jobId, {}) : await jobsAdminApi.applications({});
      setItems(toArray(data));
    } catch (error) {
      setError(pickMessage(error));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [jobId]);

  async function updateStatus(applicationId, status) {
    setBusyId(applicationId);
    try {
      await jobsAdminApi.updateApplicationStatus(applicationId, { status });
      await load();
    } catch (error) {
      setError(pickMessage(error));
    } finally {
      setBusyId('');
    }
  }

  const stats = useMemo(() => ({
    total: items.length,
    reviewing: items.filter((item) => (item.status || 'submitted') === 'reviewing').length,
    hired: items.filter((item) => (item.status || 'submitted') === 'hired').length,
  }), [items]);

  return (
    <div className="stack-lg">
      <PageHeader
        title="Quản lý ứng tuyển"
        subtitle={jobId ? `Danh sách ứng tuyển của job ${jobId}` : 'Toàn bộ đơn ứng tuyển trong hệ thống'}
        icon="submissions"
        actions={<Link className="btn btn-secondary" to="/jobs">Quay lại jobs</Link>}
      />
      <div className="stats-grid stats-grid-tight">
        <StatCard label="Tổng đơn" value={stats.total} icon="submissions" tone="info" />
        <StatCard label="Đang duyệt" value={stats.reviewing} icon="activity" tone="warning" />
        <StatCard label="Đã tuyển" value={stats.hired} icon="spark" tone="default" />
      </div>
      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <LoadingState label="Đang tải ứng tuyển..." /> : null}
      {!loading && items.length === 0 ? <EmptyState title="Không có đơn ứng tuyển" description="Chưa có bản ghi phù hợp với job hiện tại." /> : null}
      {!loading && items.length > 0 ? (
        <div className="card section-card table-wrap">
          <div className="section-title-row">
            <div>
              <div className="eyebrow">Applications</div>
              <h3>Pipeline ứng tuyển</h3>
            </div>
            <div className="meta-chip">{formatNumber(items.length)} bản ghi</div>
          </div>
          <table className="table admin-table">
            <thead>
              <tr>
                <th>Ứng viên</th>
                <th>Job</th>
                <th>CV</th>
                <th>Trạng thái</th>
                <th>Cập nhật</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const id = item.id || item.applicationId || index;
                const currentStatus = item.status || 'submitted';
                return (
                  <tr key={id}>
                    <td>
                      <div className="stack-xs">
                        <strong>{item.userId || item.applicantId || item.email || '-'}</strong>
                        <span className="tiny code-inline">{id}</span>
                      </div>
                    </td>
                    <td>{item.jobId || jobId || '-'}</td>
                    <td className="truncate-cell">{item.cvUrl || item.resumeUrl || '-'}</td>
                    <td><StatusBadge value={currentStatus} /></td>
                    <td>
                      <select value={currentStatus} disabled={busyId === id} onChange={(e) => updateStatus(id, e.target.value)}>
                        {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
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
