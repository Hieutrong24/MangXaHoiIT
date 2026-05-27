import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { usersAdminApi } from '../api/users.api';
import { pickMessage, toArray } from '../../../shared/utils/api';
import { formatDateTime, formatNumber, initials } from '../../../shared/utils/format';
import PageHeader from '../../../shared/components/PageHeader.jsx';
import LoadingState from '../../../shared/components/LoadingState.jsx';
import EmptyState from '../../../shared/components/EmptyState.jsx';
import StatusBadge from '../../../shared/components/StatusBadge.jsx';
import StatCard from '../../../shared/components/StatCard.jsx';
import AppIcon from '../../../shared/components/AppIcon.jsx';
import { ProgressColumns, SparklineCard } from '../../../shared/components/TrendCharts.jsx';

function normalizeUser(item) {
  return {
    id: item?.id || item?.userId || item?.profileId || item?.accountId,
    fullName: item?.fullName || item?.displayName || item?.full_name || item?.name || 'Người dùng chưa đặt tên',
    email: item?.email || item?.tdmuEmail || '-',
    username: item?.username || '-',
    status: item?.status || (item?.isLocked ? 'locked' : 'active'),
    locked: Boolean(item?.isLocked || item?.lockedAt),
    createdAt: item?.createdAt || item?.updatedAt || null,
  };
}

function UserMetricCard({ label, value, detail, icon, tone, trend, progress }) {
  return (
    <article className={`user-directory-metric tone-${tone}`}>
      <div className="user-metric-copy">
        <span>{label}</span>
        <strong>{value}</strong>
        {progress === undefined ? (
          <small className={trend ? 'is-positive' : ''}>
            {trend ? <AppIcon name="activity" size={14} /> : null}
            {detail}
          </small>
        ) : (
          <div className="user-metric-progress" aria-label={`${label}: ${progress}%`}>
            <i style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
      <div className="user-metric-icon">
        <AppIcon name={icon} size={22} />
      </div>
    </article>
  );
}

function UserGrowthSparkline({ active }) {
  const points = [28, 44, 36, 52, 50, 68, 74, 88];
  const path = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${index * 56} ${100 - point}`)
    .join(' ');

  return (
    <article className="user-insight-card user-growth-card">
      <div className="user-card-heading">
        <div>
          <h2>Tài khoản khả dụng</h2>
          <p>Tăng trưởng trong 30 ngày qua</p>
        </div>
        <div className="user-growth-value">
          <strong>{formatNumber(active)}</strong>
          <span>+6%</span>
        </div>
      </div>
      <svg className="user-sparkline" viewBox="0 0 392 112" preserveAspectRatio="none" role="img" aria-label="Biểu đồ tăng trưởng tài khoản">
        <path d={`${path} L 392 112 L 0 112 Z`} className="user-sparkline-fill" />
        <path d={path} className="user-sparkline-line" />
      </svg>
    </article>
  );
}

function UserStatusDistribution({ stats }) {
  const max = Math.max(stats.total, stats.active, stats.locked, 1);
  const items = [
    { label: 'Hoạt động', value: stats.active, tone: 'active' },
    { label: 'Bị khóa', value: stats.locked, tone: 'locked' },
    { label: 'Tổng', value: stats.total, tone: 'total' },
  ];

  return (
    <article className="user-insight-card user-status-card">
      <h2>Phân bố trạng thái</h2>
      <div className="user-status-bars">
        {items.map((item) => (
          <div className={`user-status-bar tone-${item.tone}`} key={item.label}>
            <i style={{ height: `${Math.max((item.value / max) * 100, item.value ? 8 : 3)}%` }} />
            <strong>{formatNumber(item.value)}</strong>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

export default function UsersPage() {
  const [filters, setFilters] = useState({ keyword: '', page: 1, pageSize: 20 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);
  const [busyId, setBusyId] = useState('');

  async function load(requestFilters = filters) {
    setLoading(true);
    setError('');
    try {
      const data = await usersAdminApi.list(requestFilters);
      setItems(toArray(data).map(normalizeUser));
    } catch (error) {
      setError(pickMessage(error));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filters.page, filters.pageSize]);

  async function handleSearch(event) {
    event.preventDefault();
    const nextFilters = { ...filters, page: 1 };
    setFilters(nextFilters);
    await load(nextFilters);
  }

  async function toggleLock(user) {
    const reason = window.prompt(user.locked ? 'Lý do mở khóa' : 'Lý do khóa tài khoản', 'admin action') || 'admin action';
    setBusyId(user.id);
    try {
      if (user.locked) {
        await usersAdminApi.unlock(user.id, { reason });
      } else {
        await usersAdminApi.lock(user.id, { reason });
      }
      await load();
    } catch (error) {
      setError(pickMessage(error));
    } finally {
      setBusyId('');
    }
  }

  async function removeUser(user) {
    const confirmed = window.confirm(`Xóa user ${user.fullName} (${user.email})?`);
    if (!confirmed) return;
    const reason = window.prompt('Nhập lý do xóa', 'soft delete by admin') || 'soft delete by admin';
    setBusyId(user.id);
    try {
      await usersAdminApi.remove(user.id, { reason });
      await load();
    } catch (error) {
      setError(pickMessage(error));
    } finally {
      setBusyId('');
    }
  }

  const stats = useMemo(() => ({
    total: items.length,
    locked: items.filter((item) => item.locked).length,
    active: items.filter((item) => !item.locked).length,
  }), [items]);

  const hasData = items.length > 0;
  const activeRatio = stats.total ? Math.round((stats.active / stats.total) * 100) : 0;
  const pageStart = hasData ? ((filters.page - 1) * filters.pageSize) + 1 : 0;
  const pageEnd = hasData ? pageStart + items.length - 1 : 0;

  return (
    <main className="user-directory-stitch">
      <header className="user-directory-hero">
        <div>
          <h1>Quản lý người dùng</h1>
          <p>Theo dõi và quản trị tài khoản người dùng trên hệ thống</p>
        </div>
        <button className="user-directory-primary" type="button">
          <AppIcon name="plus" size={18} />
          Tạo tài khoản mới
        </button>
      </header>

      <section className="user-directory-kpis" aria-label="Chỉ số người dùng">
        <UserMetricCard label="Tổng người dùng" value={formatNumber(stats.total)} detail="+12% tháng này" icon="users" tone="teal" trend />
        <UserMetricCard label="Đang hoạt động" value={formatNumber(stats.active)} detail={`Trực tuyến: ${Math.min(stats.active, 42)}`} icon="spark" tone="green" />
        <UserMetricCard label="Bị khóa" value={formatNumber(stats.locked)} detail={`Yêu cầu xem xét: ${Math.min(stats.locked, 2)}`} icon="lock" tone="red" />
        <UserMetricCard label="Tỷ lệ active" value={`${activeRatio}%`} icon="dashboard" tone="violet" progress={activeRatio} />
      </section>

      <section className="user-directory-insights" aria-label="Phân tích người dùng">
        <UserGrowthSparkline active={stats.active} />
        <UserStatusDistribution stats={stats} />
      </section>

      <section className="user-directory-filter">
        <form className="user-filter-form" onSubmit={handleSearch}>
          <label className="user-search-field">
            <AppIcon name="search" size={17} />
            <input
              placeholder="Tìm theo tên, email, ID..."
              value={filters.keyword}
              onChange={(event) => setFilters((prev) => ({ ...prev, keyword: event.target.value }))}
            />
          </label>
          <select value={filters.pageSize} onChange={(event) => setFilters((prev) => ({ ...prev, pageSize: Number(event.target.value), page: 1 }))}>
            <option value={10}>10 hàng</option>
            <option value={20}>20 hàng</option>
            <option value={50}>50 hàng</option>
            <option value={100}>100 hàng</option>
          </select>
          <button className="user-filter-submit" type="submit">Tìm</button>
          <button
            className="user-filter-reset"
            type="button"
            onClick={() => {
              const nextFilters = { keyword: '', page: 1, pageSize: 20 };
              setFilters(nextFilters);
              load(nextFilters);
            }}
          >
            Đặt lại
          </button>
        </form>
      </section>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <LoadingState label="Đang tải danh sách người dùng..." /> : null}
      {!loading && !hasData ? <EmptyState title="Không tìm thấy người dùng" description="Thử điều chỉnh bộ lọc tìm kiếm của bạn." /> : null}

      {!loading && hasData ? (
        <section className="user-directory-table-card">
          <div className="user-table-heading">
            <div>
              <h2>Quản lý user</h2>
              <span>{formatNumber(items.length)} bản ghi</span>
            </div>
            <button className="user-table-more" type="button" aria-label="Tùy chọn bảng">
              <AppIcon name="menu" size={18} />
            </button>
          </div>

          <div className="user-table-scroll">
            <table className="user-directory-table">
              <thead>
                <tr>
                  <th>Người dùng</th>
                  <th>Username</th>
                  <th>Trạng thái</th>
                  <th>Thời gian</th>
                  <th>Tác vụ</th>
                </tr>
              </thead>
              <tbody>
                {items.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-person-cell">
                        <div className="user-avatar">{initials(user.fullName)}</div>
                        <div>
                          <strong>{user.fullName}</strong>
                          <span>{user.email}</span>
                          <small>ID: {user.id || '-'}</small>
                        </div>
                      </div>
                    </td>
                    <td>{user.username}</td>
                    <td><StatusBadge value={user.status} /></td>
                    <td>{formatDateTime(user.createdAt)}</td>
                    <td>
                      <div className="user-actions">
                        <Link className="user-icon-button tone-primary" to={`/users/${user.id}`} title="Chi tiết">
                          <AppIcon name="eye" size={18} />
                        </Link>
                        <button className="user-icon-button tone-neutral" type="button" disabled={busyId === user.id} onClick={() => toggleLock(user)} title={user.locked ? 'Mở khóa' : 'Khóa'}>
                          <AppIcon name={user.locked ? 'unlock' : 'lock'} size={18} />
                        </button>
                        <button className="user-icon-button tone-danger" type="button" disabled={busyId === user.id} onClick={() => removeUser(user)} title="Xóa">
                          <AppIcon name="trash" size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <footer className="user-table-footer">
            <span>Hiển thị <strong>{pageStart} - {pageEnd}</strong> của <strong>{formatNumber(items.length)}</strong> người dùng</span>
            <nav className="user-pagination" aria-label="Phân trang người dùng">
              <button type="button" disabled={filters.page <= 1} onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}>
                <AppIcon name="chevronRight" size={18} className="rotate-180" />
              </button>
              <b>{filters.page}</b>
              <button type="button" disabled={items.length < filters.pageSize} onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}>
                <AppIcon name="chevronRight" size={18} />
              </button>
            </nav>
          </footer>
        </section>
      ) : null}
    </main>
  );

  return (
    <div className="stack-lg">
      <div className="page-hero"><div><h1 className="page-hero-title">Quản lý người dùng</h1><p className="page-hero-subtitle">Theo dõi và quản trị tài khoản người dùng trên hệ thống</p></div><div className="page-hero-actions"><button className="primary-action"><AppIcon name="plus" size={16} />Tạo tài khoản mới</button></div></div>

      <div className="stats-grid user-summary-grid compact-stat-grid">
        <StatCard label="Tổng người dùng" value={stats.total} icon="users" tone="info" hint="Overall" />
        <StatCard label="Đang hoạt động" value={stats.active} icon="spark" tone="success" hint="Active" />
        <StatCard label="Bị khóa" value={stats.locked} icon="lock" tone="danger" hint="Security" />
        <StatCard label="Tỷ lệ active" value={`${stats.total ? Math.round((stats.active / stats.total) * 100) : 0}%`} icon="dashboard" tone="violet" hint="Ratio" />
      </div>

      <div className="dashboard-grid">
        <SparklineCard title="Tài khoản khả dụng" value={stats.active} delta="+6%" points={[5, 7, 11, 13, 15, 18, Math.max(stats.active, 1)]} />
        <div className="card section-card"><div className="section-title-row"><div><div className="eyebrow">User mix</div><h3>Phân bố trạng thái</h3></div></div><ProgressColumns items={[{ label: 'Active', value: stats.active }, { label: 'Locked', value: stats.locked }, { label: 'Total', value: stats.total }]} /></div>
      </div>

      <div className="card section-card">
        <form className="toolbar toolbar-rich" onSubmit={handleSearch}>
          <div className="input-with-icon grow-2">
            <AppIcon name="search" size={16} />
            <input placeholder="Tìm theo tên, email hoặc username" value={filters.keyword} onChange={(e) => setFilters((prev) => ({ ...prev, keyword: e.target.value }))} />
          </div>
          <select value={filters.pageSize} onChange={(e) => setFilters((prev) => ({ ...prev, pageSize: Number(e.target.value), page: 1 }))}>
            <option value={10}>10 / trang</option>
            <option value={20}>20 / trang</option>
            <option value={50}>50 / trang</option>
          </select>
          <button className="btn btn-primary"><AppIcon name="search" size={16} />Tìm</button>
          <button type="button" className="btn btn-secondary" onClick={() => { setFilters({ keyword: '', page: 1, pageSize: 20 }); }}>Đặt lại</button>
        </form>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <LoadingState label="Đang tải danh sách người dùng..." /> : null}
      {!loading && !hasData ? <EmptyState title="Chưa có người dùng phù hợp" description="Thử thay đổi từ khóa tìm kiếm hoặc tải lại dữ liệu." /> : null}

      {!loading && hasData ? (
        <div className="card section-card table-wrap">
          <div className="section-title-row">
            <div>
              <div className="eyebrow">Danh sách tài khoản</div>
              <h3>Quản lý user</h3>
            </div>
            <div className="meta-chip">{formatNumber(items.length)} bản ghi</div>
          </div>
          <table className="table admin-table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Username</th>
                <th>Trạng thái</th>
                <th>Thời gian</th>
                <th>Tác vụ</th>
              </tr>
            </thead>
            <tbody>
              {items.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="person-cell">
                      <div className="person-avatar">{initials(user.fullName)}</div>
                      <div>
                        <strong>{user.fullName}</strong>
                        <div className="muted small">{user.email}</div>
                        <div className="tiny code-inline">{user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>{user.username}</td>
                  <td><StatusBadge value={user.status} /></td>
                  <td>{formatDateTime(user.createdAt)}</td>
                  <td>
                    <div className="row-actions">
                      <Link className="btn btn-secondary" to={`/users/${user.id}`}><AppIcon name="eye" size={16} />Chi tiết</Link>
                      <button className="btn btn-warning" disabled={busyId === user.id} onClick={() => toggleLock(user)}>
                        <AppIcon name={user.locked ? 'unlock' : 'lock'} size={16} />{user.locked ? 'Mở khóa' : 'Khóa'}
                      </button>
                      <button className="btn btn-danger" disabled={busyId === user.id} onClick={() => removeUser(user)}><AppIcon name="trash" size={16} />Xóa</button>
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
