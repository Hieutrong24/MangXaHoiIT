import { useEffect, useMemo, useState } from 'react';
import { pickMessage, toArray } from '../../../shared/utils/api';
import { formatDateTime, formatNumber, humanizeKey, initials } from '../../../shared/utils/format';
import { securityAdminApi } from '../../../shared/utils/adminApi';
import PageHeader from '../../../shared/components/PageHeader.jsx';
import LoadingState from '../../../shared/components/LoadingState.jsx';
import EmptyState from '../../../shared/components/EmptyState.jsx';
import StatCard from '../../../shared/components/StatCard.jsx';
import AppIcon from '../../../shared/components/AppIcon.jsx';

function normalizeLog(item) {
  return {
    id: item?.id || item?.auditLogId || item?._id || `${item?.userId || 'user'}-${item?.createdAt || item?.timestamp || ''}`,
    userId: item?.userId || item?.actorId || '-',
    email: item?.email || item?.actorEmail || '-',
    action: item?.action || item?.eventType || item?.type || 'unknown',
    target: item?.target || item?.resourceType || item?.resourceId || '-',
    ipAddress: item?.ipAddress || item?.ip || '-',
    userAgent: item?.userAgent || item?.deviceInfo || '-',
    createdAt: item?.createdAt || item?.occurredAt || item?.timestamp || null,
    status: item?.success === false ? 'rejected' : item?.status || 'active',
  };
}

export default function SecurityAuditPage() {
  const [filters, setFilters] = useState({ keyword: '', page: 1, pageSize: 20 });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await securityAdminApi.listAuditLogs(filters);
      setItems(toArray(data).map(normalizeLog));
    } catch (nextError) {
      setError(pickMessage(nextError));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [filters.page, filters.pageSize]);

  const stats = useMemo(() => ({
    total: items.length,
    highRisk: items.filter((item) => /lock|delete|role|permission/i.test(item.action)).length,
    accessChanges: items.filter((item) => /login|logout|token|auth/i.test(item.action)).length,
    uniqueActors: new Set(items.map((item) => item.userId)).size,
  }), [items]);

  return (
    <div className="stack-lg">
      <PageHeader
        title="Nhật ký kiểm tra bảo mật"
        subtitle="Theo dõi log xác thực, thay đổi quyền và các thao tác rủi ro trong hệ thống."
        icon="fileText"
      />

      <div className="stats-grid security-summary-grid compact-stat-grid">
        <StatCard label="Nhật ký audit" value={stats.total} icon="activity" tone="info" hint="Sự kiện" />
        <StatCard label="Rủi ro cao" value={stats.highRisk} icon="shield" tone="danger" hint="Nghiêm trọng" />
        <StatCard label="Luồng truy cập" value={stats.accessChanges} icon="key" tone="success" hint="Xác thực" />
        <StatCard label="Người thực hiện" value={stats.uniqueActors} icon="users" tone="violet" hint="Phạm vi" />
      </div>

      <div className="card section-card">
        <form className="toolbar toolbar-rich" onSubmit={(event) => { event.preventDefault(); load(); }}>
          <div className="input-with-icon grow-2">
            <AppIcon name="search" size={16} />
            <input
              placeholder="Tìm theo user, hành động, đối tượng hoặc IP"
              value={filters.keyword}
              onChange={(event) => setFilters((prev) => ({ ...prev, keyword: event.target.value }))}
            />
          </div>
          <select value={filters.pageSize} onChange={(event) => setFilters((prev) => ({ ...prev, pageSize: Number(event.target.value), page: 1 }))}>
            <option value={10}>10 / trang</option>
            <option value={20}>20 / trang</option>
            <option value={50}>50 / trang</option>
          </select>
          <button className="btn btn-primary"><AppIcon name="refresh" size={16} />Tải lại</button>
        </form>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <LoadingState label="Đang tải nhật ký kiểm tra bảo mật..." /> : null}
      {!loading && !items.length ? <EmptyState title="Không có nhật ký audit" description="Thử mở rộng bộ lọc hoặc kiểm tra luồng audit từ auth-service." /> : null}

      {!loading && items.length ? (
        <div className="card section-card table-wrap">
          <div className="section-title-row">
            <div>
              <div className="eyebrow">Dòng truy vết</div>
              <h3>Sự kiện audit</h3>
            </div>
            <div className="meta-chip">{formatNumber(items.length)} bản ghi</div>
          </div>
          <table className="table admin-table">
            <thead>
              <tr>
                <th>Người thực hiện</th>
                <th>Hành động</th>
                <th>Đối tượng</th>
                <th>IP / thiết bị</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="person-cell">
                      <div className="person-avatar">{initials(item.email)}</div>
                      <div>
                        <strong>{item.email}</strong>
                        <div className="muted small">{item.userId}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <strong>{humanizeKey(item.action)}</strong>
                    <div className="muted tiny">{item.status}</div>
                  </td>
                  <td>{humanizeKey(item.target)}</td>
                  <td>
                    <div className="stack-xs">
                      <span>{item.ipAddress}</span>
                      <span className="muted tiny truncate-copy">{item.userAgent}</span>
                    </div>
                  </td>
                  <td>{formatDateTime(item.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="table-footer">
            <button className="btn btn-secondary" disabled={filters.page <= 1} onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}>Trang trước</button>
            <div className="muted small">Trang {filters.page}</div>
            <button className="btn btn-secondary" disabled={items.length < filters.pageSize} onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}>Trang sau</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
