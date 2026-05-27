import { useEffect, useMemo, useState } from 'react';
import { usersAdminApi } from '../api/users.api';
import { pickMessage, toArray, toObject } from '../../../shared/utils/api';
import { formatDateTime, formatNumber } from '../../../shared/utils/format';
import PageHeader from '../../../shared/components/PageHeader.jsx';
import StatCard from '../../../shared/components/StatCard.jsx';
import LoadingState from '../../../shared/components/LoadingState.jsx';
import EmptyState from '../../../shared/components/EmptyState.jsx';
import { BarChart } from '../../../shared/components/BarChart.jsx';
import { ProgressColumns, SparklineCard } from '../../../shared/components/TrendCharts.jsx';
import AppIcon from '../../../shared/components/AppIcon.jsx';

function ActivityKpiCard({ label, value, icon, tone }) {
  return (
    <article className={`activity-kpi-card tone-${tone}`}>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <i>
        <AppIcon name={icon} size={23} />
      </i>
    </article>
  );
}

function ActivityTrendCard({ title, value, badge, tone, variant }) {
  return (
    <article className="activity-trend-card">
      <div className="activity-card-topline">
        <h3>{title}</h3>
        <span className={`activity-trend-badge tone-${tone}`}>{badge}</span>
      </div>
      <div className="activity-trend-value">
        <strong>{value}</strong>
        <small className={tone === 'live' ? 'is-positive' : ''}>
          <AppIcon name={tone === 'live' ? 'activity' : 'spark'} size={13} />
          {tone === 'muted' ? '0%' : '+12%'}
        </small>
      </div>
      {variant === 'line' ? (
        <svg className="activity-trend-line" viewBox="0 0 100 24" preserveAspectRatio="none" role="img" aria-label={title}>
          <path d="M0 24 L0 12 Q25 3 50 14 T100 7 L100 24 Z" />
          <path d="M0 12 Q25 3 50 14 T100 7" />
        </svg>
      ) : (
        <div className={`activity-trend-bars variant-${variant || 'bars'}`} aria-hidden="true">
          {[36, 54, 28, 72, 46, 86, 100].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}
        </div>
      )}
    </article>
  );
}

function ActivityActionBars({ items }) {
  const max = Math.max(...items.map((item) => item.value), 1);

  if (!items.length) {
    return <div className="activity-empty-inline">Không có hành động nổi bật.</div>;
  }

  return (
    <div className="activity-action-bars">
      {items.slice(0, 5).map((item) => (
        <div className="activity-action-row" key={item.label}>
          <div>
            <span>{item.label}</span>
            <b>{formatNumber(item.value)} logs</b>
          </div>
          <i><em style={{ width: `${Math.max((item.value / max) * 100, 6)}%` }} /></i>
        </div>
      ))}
    </div>
  );
}

function ActivityDistribution({ totalLogs, last7, last30 }) {
  const max = Math.max(totalLogs, last30, last7, 1);
  const items = [
    { label: '7d', value: last7 },
    { label: '30d', value: last30 },
    { label: 'Total', value: totalLogs },
  ];

  return (
    <div className="activity-distribution">
      <h3>Tỷ trọng log theo mốc</h3>
      <div>
        {items.map((item) => (
          <section key={item.label}>
            <strong>{formatNumber(item.value)}</strong>
            <i style={{ height: `${Math.max((item.value / max) * 100, item.value ? 10 : 4)}%` }} />
            <span>{item.label}</span>
          </section>
        ))}
      </div>
    </div>
  );
}

function getActionTone(action) {
  const value = String(action || '').toLowerCase();
  if (value.includes('submit') || value.includes('code')) return 'success';
  if (value.includes('login')) return 'primary';
  if (value.includes('view')) return 'tertiary';
  if (value.includes('fail') || value.includes('delete')) return 'danger';
  return 'neutral';
}

export default function UserActivityPage() {
  const [filters, setFilters] = useState({ userId: '', action: '', page: 1, pageSize: 50 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [logs, setLogs] = useState([]);
  const [dashboard, setDashboard] = useState({});

  async function load(requestFilters = filters) {
    setLoading(true);
    setError('');
    try {
      const [logsData, dashData] = await Promise.all([
        usersAdminApi.activityLogs(requestFilters),
        usersAdminApi.activityDashboard({ userId: requestFilters.userId || undefined }),
      ]);
      setLogs(toArray(logsData));
      setDashboard(toObject(dashData));
    } catch (error) {
      setError(pickMessage(error));
      setLogs([]);
      setDashboard({});
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filters.page, filters.pageSize]);

  const topActions = useMemo(() => {
    const items = toArray(dashboard.topActions).map((item) => ({ label: item.action || item.name || 'Khác', value: item.count || 0 }));
    if (items.length) return items.slice(0, 7);
    const counts = logs.reduce((acc, item) => {
      const key = item.action || item.event || 'Khác';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([label, value]) => ({ label, value })).slice(0, 7);
  }, [dashboard, logs]);

  const recentActivities = toArray(dashboard.recentActivities).slice(0, 6);
  const totalLogs = dashboard.totalLogs ?? dashboard.total ?? logs.length;
  const last7 = dashboard.totals?.activityLast7Days ?? dashboard.activityLast7Days ?? 0;
  const last30 = dashboard.totals?.activityLast30Days ?? dashboard.activityLast30Days ?? 0;
  const trackedUser = filters.userId || 'Tất cả';
  const displayRecentActivities = (recentActivities.length ? recentActivities : logs).slice(0, 3);
  const realtimeRate = Math.max(Math.round((logs.length || totalLogs) / 18), logs.length ? 1 : 0);
  const weeklyEvents = Math.max(last7 * 7, last7, logs.length);

  return (
    <main className="activity-console-page">
      <header className="activity-console-hero">
        <div>
          <div className="activity-hero-title">
            <AppIcon name="activity" size={28} />
            <h1>Nhật ký hoạt động người dùng</h1>
          </div>
          <p>Theo dõi hành vi, truy vết event và nhìn nhanh xu hướng tương tác trong hệ thống.</p>
        </div>
        <div className="activity-live-stack">
          <span>Live System</span>
          <b><i />Đang đồng bộ</b>
        </div>
      </header>

      <section className="activity-control-grid">
        <article className="activity-control-card">
          <div className="activity-section-heading">
            <h2>Điều khiển truy vết</h2>
            <span>Trang {filters.page}</span>
          </div>
          <form
            className="activity-filter-grid"
            onSubmit={(event) => {
              event.preventDefault();
              const nextFilters = { ...filters, page: 1 };
              setFilters(nextFilters);
              load(nextFilters);
            }}
          >
            <label>
              <span>User ID</span>
              <div>
                <AppIcon name="users" size={16} />
                <input placeholder="ID người dùng..." value={filters.userId} onChange={(event) => setFilters((prev) => ({ ...prev, userId: event.target.value }))} />
              </div>
            </label>
            <label>
              <span>Hành động</span>
              <div>
                <AppIcon name="activity" size={16} />
                <input placeholder="Lọc log..." value={filters.action} onChange={(event) => setFilters((prev) => ({ ...prev, action: event.target.value }))} />
              </div>
            </label>
            <label>
              <span>Số lượng</span>
              <select value={filters.pageSize} onChange={(event) => setFilters((prev) => ({ ...prev, pageSize: Number(event.target.value), page: 1 }))}>
                <option value={20}>20 logs / trang</option>
                <option value={50}>50 logs / trang</option>
                <option value={100}>100 logs / trang</option>
              </select>
            </label>
            <button type="submit">
              <AppIcon name="refresh" size={16} />
              Tải lại
            </button>
          </form>
          {error ? <div className="alert alert-error inline-alert">{error}</div> : null}
        </article>

        <article className="activity-watch-card">
          <h2>Realtime watch</h2>
          <div className="activity-watch-grid">
            <div><span>Nguồn log</span><strong>{formatNumber(totalLogs)}</strong></div>
            <div><span>7 ngày</span><strong>{formatNumber(last7)}</strong></div>
            <div><span>30 ngày</span><strong>{formatNumber(last30)}</strong></div>
            <div><span>Theo dõi</span><strong>{trackedUser}</strong></div>
          </div>
        </article>
      </section>

      {loading ? <LoadingState label="Đang tải log hoạt động..." /> : null}

      <section className="activity-kpi-grid" aria-label="Chỉ số activity log">
        <ActivityKpiCard label="Tổng logs" value={formatNumber(totalLogs)} icon="server" tone="primary" />
        <ActivityKpiCard label="7 ngày" value={formatNumber(last7)} icon="spark" tone="success" />
        <ActivityKpiCard label="30 ngày" value={formatNumber(last30)} icon="dashboard" tone="tertiary" />
        <ActivityKpiCard label="User theo dõi" value={trackedUser} icon="eye" tone="violet" />
      </section>

      <section className="activity-trend-grid" aria-label="Xu hướng activity log">
        <ActivityTrendCard title="Lưu lượng Realtime" value={`${formatNumber(realtimeRate)} logs/m`} badge="Live" tone="live" />
        <ActivityTrendCard title="Tương tác Weekly" value={`${formatNumber(weeklyEvents)} ev`} badge="Tuần này" tone="neutral" variant="line" />
        <ActivityTrendCard title="User Monthly" value={trackedUser === 'Tất cả' ? `${formatNumber(last30)} logs` : trackedUser} badge="Tháng này" tone="muted" variant="pills" />
      </section>

      <section className="activity-analysis-grid">
        <article className="activity-analysis-card">
          <h2>Top action</h2>
          <ActivityActionBars items={topActions} />
        </article>

        <article className="activity-analysis-card">
          <h2>Hoạt động gần nhất</h2>
          <ActivityDistribution totalLogs={totalLogs} last7={last7} last30={last30} />
          <div className="activity-recent-list">
            {displayRecentActivities.map((item, index) => {
              const action = item.eventType || item.action || item.event || 'Activity';
              const actor = item.userId || item.actorId || item.aggregateId || 'Hệ thống';
              const target = item.targetId || item.targetType || item.aggregateId || 'Sự kiện hệ thống';
              return (
                <div className="activity-recent-item" key={item.eventId || item.id || index}>
                  <i><AppIcon name={getActionTone(action) === 'success' ? 'code' : 'activity'} size={16} /></i>
                  <div>
                    <div>
                      <strong>{actor}</strong>
                      <span>{formatDateTime(item.occurredAt || item.createdAt || item.timestamp)}</span>
                    </div>
                    <p>{action} - {target}</p>
                  </div>
                </div>
              );
            })}
            {!displayRecentActivities.length ? <div className="activity-empty-inline">Không có dữ liệu hoạt động gần đây.</div> : null}
          </div>
        </article>
      </section>

      {!loading && logs.length === 0 ? <EmptyState title="Không có activity log" description="Bộ lọc hiện tại chưa trả về bản ghi nào." /> : null}

      {!loading && logs.length > 0 ? (
        <section className="activity-log-table-card">
          <div className="activity-table-heading">
            <div>
              <h2>Dòng sự kiện</h2>
              <span>{formatNumber(logs.length)} bản ghi</span>
            </div>
            <button type="button">Xem tất cả</button>
          </div>
          <div className="activity-table-scroll">
            <table className="activity-log-table">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Target</th>
                  <th>Metadata</th>
                  <th>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((item, index) => {
                  const action = item.action || item.event || item.eventType || '-';
                  return (
                    <tr key={item.id || item.eventId || index}>
                      <td>{formatDateTime(item.createdAt || item.timestamp || item.occurredAt)}</td>
                      <td>
                        <strong>{item.userId || item.actorId || '-'}</strong>
                        <small>{item.aggregateId || item.eventId || ''}</small>
                      </td>
                      <td><span className={`activity-action-pill tone-${getActionTone(action)}`}>{action}</span></td>
                      <td>{item.targetId || item.targetType || '-'}</td>
                      <td><code>{JSON.stringify(item.metadata || item.meta || {})}</code></td>
                      <td>
                        <button className="activity-detail-button" type="button" aria-label="Xem chi tiết log">
                          <AppIcon name="eye" size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <footer className="activity-table-footer">
            <button type="button" disabled={filters.page <= 1} onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}>
              <AppIcon name="chevronRight" size={16} className="activity-icon-left" />
            </button>
            <b>{filters.page}</b>
            <button type="button" disabled={logs.length < filters.pageSize} onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}>
              <AppIcon name="chevronRight" size={16} />
            </button>
          </footer>
        </section>
      ) : null}
    </main>
  );

  return (
    <div className="stack-lg">
      <PageHeader title="Nhật ký hoạt động người dùng" subtitle="Theo dõi hành vi, truy vết event và nhìn nhanh xu hướng tương tác trong hệ thống." icon="activity" />

      <div className="activity-toolbar-grid">
        <div className="card section-card activity-filter-card surface-soft">
          <div className="section-title-row compact-gap">
            <div>
              <div className="eyebrow">Bộ lọc log</div>
              <h3>Điều khiển truy vết</h3>
            </div>
            <div className="meta-chip">Trang {filters.page}</div>
          </div>
          <form className="toolbar toolbar-rich activity-toolbar" onSubmit={(e) => { e.preventDefault(); load(); }}>
            <div className="input-with-icon grow-1"><AppIcon name="users" size={16} /><input placeholder="Lọc theo userId" value={filters.userId} onChange={(e) => setFilters((prev) => ({ ...prev, userId: e.target.value }))} /></div>
            <div className="input-with-icon grow-1"><AppIcon name="activity" size={16} /><input placeholder="Lọc theo action" value={filters.action} onChange={(e) => setFilters((prev) => ({ ...prev, action: e.target.value }))} /></div>
            <select value={filters.pageSize} onChange={(e) => setFilters((prev) => ({ ...prev, pageSize: Number(e.target.value), page: 1 }))}>
              <option value={20}>20 / trang</option>
              <option value={50}>50 / trang</option>
              <option value={100}>100 / trang</option>
            </select>
            <button className="btn btn-primary"><AppIcon name="refresh" size={16} />Tải lại</button>
          </form>
          {error ? <div className="alert alert-error inline-alert">{error}</div> : null}
        </div>

        <div className="card section-card activity-summary-card">
          <div className="section-title-row compact-gap">
            <div>
              <div className="eyebrow">Theo dõi nhanh</div>
              <h3>Realtime watch</h3>
            </div>
          </div>
          <div className="mini-stat-grid">
            <div className="mini-stat surface-soft"><span className="eyebrow">Nguồn log</span><strong>{formatNumber(totalLogs)}</strong></div>
            <div className="mini-stat surface-soft"><span className="eyebrow">7 ngày</span><strong>{formatNumber(last7)}</strong></div>
            <div className="mini-stat surface-soft"><span className="eyebrow">30 ngày</span><strong>{formatNumber(last30)}</strong></div>
            <div className="mini-stat surface-soft"><span className="eyebrow">Theo dõi</span><strong>{filters.userId || 'Tất cả'}</strong></div>
          </div>
        </div>
      </div>

      {loading ? <LoadingState label="Đang tải log hoạt động..." /> : null}
      {!loading ? (
        <div className="stats-grid user-summary-grid compact-stat-grid">
          <StatCard label="Tổng logs" value={totalLogs} icon="activity" tone="info" />
          <StatCard label="7 ngày" value={last7} icon="spark" tone="success" />
          <StatCard label="30 ngày" value={last30} icon="dashboard" tone="warning" />
          <StatCard label="User đang theo dõi" value={filters.userId || 'Tất cả'} icon="users" tone="violet" />
        </div>
      ) : null}

      {!loading ? (
        <div className="trend-grid">
          <SparklineCard title="Tổng logs" value={totalLogs} delta="Realtime" points={[8, 10, 14, 12, 16, 18, Math.max(logs.length, 1)]} />
          <SparklineCard title="7 ngày" value={last7} delta="Weekly" points={[2, 4, 6, 7, 8, 10, last7]} />
          <SparklineCard title="30 ngày" value={last30} delta="Monthly" points={[4, 8, 12, 18, 22, 25, last30]} />
        </div>
      ) : null}

      {!loading ? (
        <div className="dashboard-grid dashboard-grid-activity">
          <div className="card section-card">
            <div className="section-title-row">
              <div>
                <div className="eyebrow">Top action</div>
                <h3>Phân bố hành động</h3>
              </div>
            </div>
            <BarChart items={topActions} emptyLabel="Không có hành động nổi bật" />
          </div>
          <div className="card section-card">
            <div className="section-title-row">
              <div>
                <div className="eyebrow">Hoạt động gần nhất</div>
                <h3>Recent activities</h3>
              </div>
            </div>
            <div className="sub-card" style={{ marginBottom: '16px' }}><div className="sub-card-title">Tỷ trọng log theo mốc</div><ProgressColumns items={[{ label: '7d', value: last7 }, { label: '30d', value: last30 }, { label: 'Total', value: totalLogs }]} /></div>
            <div className="recent-list compact-list">
              {recentActivities.map((item, index) => (
                <div className="recent-item" key={item.eventId || index}>
                  <div className="recent-bullet" />
                  <div>
                    <strong>{item.eventType || item.action || 'Activity'}</strong>
                    <div className="muted small">{item.aggregateId || item.userId || 'Hệ thống'}</div>
                    <div className="tiny">{formatDateTime(item.occurredAt || item.createdAt)}</div>
                  </div>
                </div>
              ))}
              {!recentActivities.length ? <div className="empty-inline">Không có dữ liệu hoạt động gần đây.</div> : null}
            </div>
          </div>
        </div>
      ) : null}

      {!loading && logs.length === 0 ? <EmptyState title="Không có activity log" description="Bộ lọc hiện tại chưa trả về bản ghi nào." /> : null}
      {!loading && logs.length > 0 ? (
        <div className="card section-card table-wrap">
          <div className="section-title-row">
            <div>
              <div className="eyebrow">Danh sách log</div>
              <h3>Dòng sự kiện</h3>
            </div>
            <div className="meta-chip">{formatNumber(logs.length)} bản ghi</div>
          </div>
          <table className="table admin-table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>User</th>
                <th>Action</th>
                <th>Target</th>
                <th>Metadata</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((item, index) => (
                <tr key={item.id || index}>
                  <td>{formatDateTime(item.createdAt || item.timestamp || item.occurredAt)}</td>
                  <td>
                    <div className="stack-xs">
                      <strong>{item.userId || item.actorId || '-'}</strong>
                      <span className="tiny muted">{item.aggregateId || item.eventId || ''}</span>
                    </div>
                  </td>
                  <td>{item.action || item.event || item.eventType || '-'}</td>
                  <td>{item.targetId || item.targetType || '-'}</td>
                  <td className="truncate-cell">{JSON.stringify(item.metadata || item.meta || {})}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
