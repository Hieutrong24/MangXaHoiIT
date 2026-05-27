import { useEffect, useMemo, useState } from 'react';
import { pickMessage, toArray, toObject } from '../../../shared/utils/api';
import { formatDateTime, formatNumber, humanizeKey } from '../../../shared/utils/format';
import { communicationAdminApi } from '../../../shared/utils/adminApi';
import PageHeader from '../../../shared/components/PageHeader.jsx';
import LoadingState from '../../../shared/components/LoadingState.jsx';
import EmptyState from '../../../shared/components/EmptyState.jsx';
import StatCard from '../../../shared/components/StatCard.jsx';
import StatusBadge from '../../../shared/components/StatusBadge.jsx';
import AppIcon from '../../../shared/components/AppIcon.jsx';

function normalizeNotification(item) {
  return {
    id: item?._id || item?.id,
    recipientId: item?.recipientId || '-',
    type: item?.type || 'unknown',
    title: item?.title || 'Thông báo chưa có tiêu đề',
    body: item?.body || '',
    status: item?.status || 'unknown',
    createdAt: item?.createdAt || item?.occurredAt || null,
  };
}

export default function NotificationsPage() {
  const [dashboard, setDashboard] = useState({});
  const [filters, setFilters] = useState({ keyword: '', type: '', status: '', page: 1, limit: 20 });
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ recipientIds: '', type: 'admin_broadcast', title: '', body: '', channels: 'in_app,email' });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [dashboardData, listData] = await Promise.all([
        communicationAdminApi.notificationsDashboard(),
        communicationAdminApi.listNotifications(filters),
      ]);
      setDashboard(toObject(dashboardData));
      setItems(toArray(listData).map(normalizeNotification));
    } catch (nextError) {
      setError(pickMessage(nextError));
      setDashboard({});
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [filters.page, filters.limit]);

  async function handleBroadcast(event) {
    event.preventDefault();
    setSending(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        recipientIds: form.recipientIds.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean),
        type: form.type,
        title: form.title,
        body: form.body,
        channels: form.channels.split(',').map((item) => item.trim()).filter(Boolean),
      };
      const result = await communicationAdminApi.broadcastNotification(payload);
      setSuccess(`Đã gửi thông báo đến ${result?.totalRecipients || payload.recipientIds.length} người nhận.`);
      setForm((prev) => ({ ...prev, title: '', body: '', recipientIds: '' }));
      await load();
    } catch (nextError) {
      setError(pickMessage(nextError));
    } finally {
      setSending(false);
    }
  }

  const stats = useMemo(() => ({
    total: dashboard.totalNotifications || 0,
    unread: dashboard.unreadNotifications || 0,
    failed: dashboard.failedNotifications || 0,
    recipients: dashboard.uniqueRecipients || 0,
    topTypes: Array.isArray(dashboard.topTypes) ? dashboard.topTypes : [],
  }), [dashboard]);

  if (loading) return <LoadingState label="Đang tải không gian thông báo..." />;

  return (
    <div className="stack-lg">
      <PageHeader
        title="Thông báo & phát tin"
        subtitle="Theo dõi chất lượng giao nhận, kiểm tra luồng thông báo và gửi thông báo quản trị theo nhóm người nhận."
        icon="megaphone"
      />

      {error ? <div className="alert alert-error">{error}</div> : null}
      {success ? <div className="top-status-chip">{success}</div> : null}

      <div className="stats-grid content-summary-grid compact-stat-grid">
        <StatCard label="Thông báo" value={stats.total} icon="bell" tone="info" hint="Tổng" />
        <StatCard label="Chưa đọc" value={stats.unread} icon="notification" tone="warning" hint="Cần chú ý" />
        <StatCard label="Thất bại" value={stats.failed} icon="trash" tone="danger" hint="Giao nhận" />
        <StatCard label="Người nhận" value={stats.recipients} icon="users" tone="violet" hint="Phạm vi" />
      </div>

      <div className="split-layout">
        <div className="card section-card">
          <div className="section-title-row">
            <div>
              <div className="eyebrow">Soạn phát tin</div>
              <h3>Gửi thông báo quản trị</h3>
            </div>
          </div>
          <form className="form-grid" onSubmit={handleBroadcast}>
            <label className="input-shell">
              <span>ID người nhận</span>
              <textarea rows={5} value={form.recipientIds} onChange={(event) => setForm((prev) => ({ ...prev, recipientIds: event.target.value }))} placeholder="user-1, user-2, user-3" />
            </label>
            <div className="form-grid-2">
              <label className="input-shell">
                <span>Loại</span>
                <input value={form.type} onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))} />
              </label>
              <label className="input-shell">
                <span>Kênh gửi</span>
                <input value={form.channels} onChange={(event) => setForm((prev) => ({ ...prev, channels: event.target.value }))} placeholder="in_app,email" />
              </label>
            </div>
            <label className="input-shell">
              <span>Tiêu đề</span>
              <input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
            </label>
            <label className="input-shell">
              <span>Nội dung</span>
              <textarea rows={5} value={form.body} onChange={(event) => setForm((prev) => ({ ...prev, body: event.target.value }))} />
            </label>
            <button className="btn btn-primary" disabled={sending}><AppIcon name="send" size={16} />{sending ? 'Đang gửi...' : 'Gửi thông báo'}</button>
          </form>
        </div>

        <div className="card section-card">
          <div className="section-title-row">
            <div>
              <div className="eyebrow">Giao nhận</div>
              <h3>Loại thông báo phổ biến</h3>
            </div>
          </div>
          <div className="service-list">
            {stats.topTypes.length ? stats.topTypes.map((item) => (
              <div className="service-row" key={item.type}>
                <div>
                  <strong>{humanizeKey(item.type)}</strong>
                  <div className="muted small">Nhóm sự kiện nổi bật</div>
                </div>
                <span className="meta-chip">{formatNumber(item.count)}</span>
              </div>
            )) : <EmptyState title="Chưa có loại thông báo" description="Thông báo phát tin và sự kiện sẽ xuất hiện ở đây khi có dữ liệu." />}
          </div>
        </div>
      </div>

      <div className="card section-card">
        <form className="toolbar toolbar-rich" onSubmit={(event) => { event.preventDefault(); load(); }}>
          <div className="input-with-icon grow-2">
            <AppIcon name="search" size={16} />
            <input value={filters.keyword} onChange={(event) => setFilters((prev) => ({ ...prev, keyword: event.target.value }))} placeholder="Tìm theo tiêu đề hoặc nội dung thông báo" />
          </div>
          <input value={filters.type} onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value }))} placeholder="Loại" />
          <input value={filters.status} onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))} placeholder="Trạng thái" />
          <button className="btn btn-primary"><AppIcon name="refresh" size={16} />Tải lại</button>
        </form>
      </div>

      {!items.length ? <EmptyState title="Không có thông báo" description="Không có bản ghi thông báo nào khớp với bộ lọc hiện tại." /> : null}
      {items.length ? (
        <div className="card section-card table-wrap">
          <div className="section-title-row">
            <div>
              <div className="eyebrow">Luồng thông báo</div>
              <h3>Thông báo đã gửi</h3>
            </div>
            <div className="meta-chip">{formatNumber(items.length)} bản ghi</div>
          </div>
          <table className="table admin-table">
            <thead>
              <tr>
                <th>Thông báo</th>
                <th>Người nhận</th>
                <th>Loại</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="stack-xs">
                      <strong>{item.title}</strong>
                      <span className="muted small truncate-copy">{item.body}</span>
                    </div>
                  </td>
                  <td><span className="code-inline">{item.recipientId}</span></td>
                  <td>{humanizeKey(item.type)}</td>
                  <td><StatusBadge value={item.status} /></td>
                  <td>{formatDateTime(item.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
