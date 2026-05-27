import { useEffect, useMemo, useState } from 'react';
import { pickMessage, toArray } from '../../../shared/utils/api';
import { formatDateTime, formatNumber, initials } from '../../../shared/utils/format';
import { securityAdminApi } from '../../../shared/utils/adminApi';
import PageHeader from '../../../shared/components/PageHeader.jsx';
import LoadingState from '../../../shared/components/LoadingState.jsx';
import EmptyState from '../../../shared/components/EmptyState.jsx';
import StatusBadge from '../../../shared/components/StatusBadge.jsx';
import StatCard from '../../../shared/components/StatCard.jsx';
import AppIcon from '../../../shared/components/AppIcon.jsx';

function normalizeAccount(item) {
  const roles = Array.isArray(item?.roles) ? item.roles : Array.isArray(item?.roleNames) ? item.roleNames : [];
  return {
    id: item?.userId || item?.id || item?.accountId,
    email: item?.email || '-',
    username: item?.username || item?.userName || '-',
    status: item?.status || (item?.isLocked ? 'locked' : 'active'),
    isLocked: Boolean(item?.isLocked || item?.lockedAt),
    roles,
    lastLoginAt: item?.lastLoginAt || item?.updatedAt || null,
    createdAt: item?.createdAt || null,
    provider: item?.provider || item?.authProvider || 'local',
  };
}

export default function SecurityAccountsPage() {
  const [filters, setFilters] = useState({ keyword: '', page: 1, pageSize: 20 });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await securityAdminApi.listAccounts(filters);
      setItems(toArray(data).map(normalizeAccount));
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

  async function toggleLock(account) {
    const reason = window.prompt(account.isLocked ? 'Lý do mở khóa tài khoản' : 'Lý do khóa tài khoản', 'rà soát bảo mật') || 'rà soát bảo mật';
    setBusyId(account.id);
    try {
      if (account.isLocked) await securityAdminApi.unlockAccount(account.id, { reason });
      else await securityAdminApi.lockAccount(account.id, { reason });
      await load();
    } catch (nextError) {
      setError(pickMessage(nextError));
    } finally {
      setBusyId('');
    }
  }

  async function editRoles(account) {
    const nextValue = window.prompt('Vai trò (phân tách bằng dấu phẩy)', account.roles.join(', '));
    if (nextValue == null) return;
    const roles = nextValue.split(',').map((item) => item.trim()).filter(Boolean);
    setBusyId(account.id);
    try {
      await securityAdminApi.updateRoles(account.id, { roles });
      await load();
    } catch (nextError) {
      setError(pickMessage(nextError));
    } finally {
      setBusyId('');
    }
  }

  const stats = useMemo(() => ({
    total: items.length,
    locked: items.filter((item) => item.isLocked).length,
    admins: items.filter((item) => item.roles.some((role) => String(role).toLowerCase().includes('admin'))).length,
    providers: new Set(items.map((item) => item.provider)).size,
  }), [items]);

  return (
    <div className="stack-lg">
      <PageHeader
        title="Danh tính & truy cập"
        subtitle="Quản lý tài khoản xác thực, khóa phiên đáng ngờ và kiểm soát quyền quản trị viên."
        icon="shield"
        actions={<div className="surface-pill">Tài khoản xác thực</div>}
      />

      <div className="stats-grid security-summary-grid compact-stat-grid">
        <StatCard label="Tài khoản" value={stats.total} icon="users" tone="default" hint="Xác thực" />
        <StatCard label="Đã khóa" value={stats.locked} icon="lock" tone="warning" hint="Rủi ro" />
        <StatCard label="Quản trị viên" value={stats.admins} icon="shield" tone="info" hint="Đặc quyền" />
        <StatCard label="Nhà cung cấp" value={stats.providers} icon="key" tone="violet" hint="Truy cập" />
      </div>

      <div className="card section-card">
        <form className="toolbar toolbar-rich" onSubmit={(event) => { event.preventDefault(); load(); }}>
          <div className="input-with-icon grow-2">
            <AppIcon name="search" size={16} />
            <input
              placeholder="Tìm theo email, username hoặc nhà cung cấp"
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
          <button type="button" className="btn btn-secondary" onClick={() => setFilters({ keyword: '', page: 1, pageSize: 20 })}>Đặt lại</button>
        </form>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <LoadingState label="Đang tải tài khoản xác thực..." /> : null}
      {!loading && !items.length ? <EmptyState title="Không tìm thấy tài khoản xác thực" description="Không có tài khoản nào phù hợp với bộ lọc hiện tại." /> : null}

      {!loading && items.length ? (
        <div className="card section-card table-wrap">
          <div className="section-title-row">
            <div>
              <div className="eyebrow">Sổ bảo mật</div>
              <h3>Tài khoản xác thực</h3>
            </div>
            <div className="meta-chip">{formatNumber(items.length)} bản ghi</div>
          </div>
          <table className="table admin-table">
            <thead>
              <tr>
                <th>Tài khoản</th>
                <th>Vai trò</th>
                <th>Status</th>
                <th>Nhà cung cấp</th>
                <th>Hoạt động gần nhất</th>
                <th>Tác vụ</th>
              </tr>
            </thead>
            <tbody>
              {items.map((account) => (
                <tr key={account.id}>
                  <td>
                    <div className="person-cell">
                      <div className="person-avatar">{initials(account.email)}</div>
                      <div>
                        <strong>{account.email}</strong>
                        <div className="muted small">{account.username}</div>
                        <div className="tiny code-inline">{account.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="tag-list">
                      {account.roles.length ? account.roles.map((role) => <span key={role} className="tag">{role}</span>) : <span className="muted small">Không có vai trò</span>}
                    </div>
                  </td>
                  <td><StatusBadge value={account.status} /></td>
                  <td>{account.provider}</td>
                  <td>
                    <div className="stack-xs">
                      <span>{formatDateTime(account.lastLoginAt)}</span>
                      <span className="muted tiny">Tạo lúc {formatDateTime(account.createdAt)}</span>
                    </div>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-secondary" disabled={busyId === account.id} onClick={() => editRoles(account)}>
                        <AppIcon name="pencil" size={16} />Vai trò
                      </button>
                      <button className="btn btn-warning" disabled={busyId === account.id} onClick={() => toggleLock(account)}>
                        <AppIcon name={account.isLocked ? 'unlock' : 'lock'} size={16} />
                        {account.isLocked ? 'Mở khóa' : 'Khóa'}
                      </button>
                    </div>
                  </td>
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
