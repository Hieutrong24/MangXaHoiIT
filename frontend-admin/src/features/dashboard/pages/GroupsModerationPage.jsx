import { useEffect, useMemo, useState } from 'react';
import { pickMessage, toArray, toObject } from '../../../shared/utils/api';
import { formatDateTime, formatNumber } from '../../../shared/utils/format';
import { contentAdminApi } from '../../../shared/utils/adminApi';
import PageHeader from '../../../shared/components/PageHeader.jsx';
import LoadingState from '../../../shared/components/LoadingState.jsx';
import EmptyState from '../../../shared/components/EmptyState.jsx';
import StatCard from '../../../shared/components/StatCard.jsx';
import StatusBadge from '../../../shared/components/StatusBadge.jsx';
import AppIcon from '../../../shared/components/AppIcon.jsx';

function normalizeGroup(item) {
  return {
    id: item?._id || item?.id,
    name: item?.name || 'Nhóm chưa có tên',
    privacy: item?.privacy || 'public',
    category: item?.category || 'general',
    ownerId: item?.ownerId || '-',
    memberCount: item?.memberCount || 0,
    postCount: item?.postCount || 0,
    pendingPostCount: item?.pendingPostCount || 0,
    createdAt: item?.createdAt || null,
  };
}

export default function GroupsModerationPage() {
  const [filters, setFilters] = useState({ keyword: '', privacy: '', page: 1, pageSize: 20 });
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [selectedGroup, setSelectedGroup] = useState({});
  const [selectedStats, setSelectedStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await contentAdminApi.listGroups(filters);
      const nextItems = toArray(data).map(normalizeGroup);
      setItems(nextItems);
      if (!selectedId && nextItems[0]?.id) setSelectedId(nextItems[0].id);
    } catch (nextError) {
      setError(pickMessage(nextError));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadDetail(groupId) {
    if (!groupId) return;
    setDetailLoading(true);
    try {
      const data = await contentAdminApi.getGroup(groupId);
      setSelectedGroup(toObject(data.group || data));
      setSelectedStats(toObject(data.stats));
    } catch (nextError) {
      setError(pickMessage(nextError));
      setSelectedGroup({});
      setSelectedStats({});
    } finally {
      setDetailLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [filters.page, filters.pageSize]);

  useEffect(() => {
    loadDetail(selectedId);
  }, [selectedId]);

  async function removeGroup(group) {
    if (!window.confirm(`Xóa cộng đồng "${group.name}"?`)) return;
    try {
      await contentAdminApi.deleteGroup(group.id);
      if (selectedId === group.id) {
        setSelectedId('');
        setSelectedGroup({});
        setSelectedStats({});
      }
      await load();
    } catch (nextError) {
      setError(pickMessage(nextError));
    }
  }

  const stats = useMemo(() => ({
    total: items.length,
    publicCount: items.filter((item) => item.privacy === 'public').length,
    privateCount: items.filter((item) => item.privacy === 'private').length,
    pendingPosts: items.reduce((acc, item) => acc + Number(item.pendingPostCount || 0), 0),
  }), [items]);

  return (
    <div className="stack-lg">
      <PageHeader
        title="Giám sát cộng đồng"
        subtitle="Kiểm tra cộng đồng, theo dõi áp lực thành viên và đánh giá sức khỏe nhóm trong không gian quản trị master-detail."
        icon="community"
      />

      <div className="stats-grid content-summary-grid compact-stat-grid">
        <StatCard label="Cộng đồng" value={stats.total} icon="community" tone="info" hint="Nhóm" />
        <StatCard label="Công khai" value={stats.publicCount} icon="home" tone="success" hint="Mở" />
        <StatCard label="Riêng tư" value={stats.privateCount} icon="lock" tone="violet" hint="Giới hạn" />
        <StatCard label="Bài chờ duyệt" value={stats.pendingPosts} icon="flag" tone="warning" hint="Cần xem" />
      </div>

      <div className="card section-card">
        <form className="toolbar toolbar-rich" onSubmit={(event) => { event.preventDefault(); load(); }}>
          <div className="input-with-icon grow-2">
            <AppIcon name="search" size={16} />
            <input value={filters.keyword} onChange={(event) => setFilters((prev) => ({ ...prev, keyword: event.target.value }))} placeholder="Tìm theo tên cộng đồng hoặc danh mục" />
          </div>
          <select value={filters.privacy} onChange={(event) => setFilters((prev) => ({ ...prev, privacy: event.target.value }))}>
            <option value="">Tất cả chế độ riêng tư</option>
            <option value="public">Công khai</option>
            <option value="private">Riêng tư</option>
          </select>
          <button className="btn btn-primary"><AppIcon name="refresh" size={16} />Tải lại</button>
        </form>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <LoadingState label="Đang tải danh sách cộng đồng..." /> : null}
      {!loading && !items.length ? <EmptyState title="Không tìm thấy cộng đồng" description="Không có nhóm nào khớp với thiết lập kiểm duyệt hiện tại." /> : null}

      {!loading && items.length ? (
        <div className="split-layout">
          <div className="card section-card">
            <div className="section-title-row">
              <div>
                <div className="eyebrow">Danh sách cộng đồng</div>
                <h3>Các nhóm</h3>
              </div>
            </div>
            <div className="selection-list">
              {items.map((group) => (
                <button key={group.id} className={`selection-item ${selectedId === group.id ? 'active' : ''}`} onClick={() => setSelectedId(group.id)}>
                  <div className="selection-copy">
                    <strong>{group.name}</strong>
                    <span className="muted small">{group.category} - chủ sở hữu {group.ownerId}</span>
                    <div className="tag-list">
                      <span className="tag">{group.memberCount} thành viên</span>
                      <span className="tag">{group.postCount} bài viết</span>
                      <span className="tag">{group.pendingPostCount} chờ duyệt</span>
                    </div>
                  </div>
                  <StatusBadge value={group.privacy} />
                </button>
              ))}
            </div>
          </div>

          <div className="card section-card">
            {detailLoading ? <LoadingState label="Đang tải chi tiết cộng đồng..." /> : null}
            {!detailLoading && !selectedGroup?._id && !selectedGroup?.id ? (
              <EmptyState title="Chọn một cộng đồng" description="Chọn một cộng đồng ở khung bên trái để xem chi tiết kiểm duyệt." />
            ) : null}
            {!detailLoading && (selectedGroup?._id || selectedGroup?.id) ? (
              <div className="stack-lg">
                <div className="section-title-row">
                  <div>
                    <div className="eyebrow">Chi tiết cộng đồng</div>
                    <h3>{selectedGroup.name}</h3>
                  </div>
                  <button className="btn btn-danger" onClick={() => removeGroup(normalizeGroup(selectedGroup))}><AppIcon name="trash" size={16} />Xóa</button>
                </div>
                <div className="detail-grid">
                  <div className="detail-item"><div className="detail-key">Chủ sở hữu</div><strong>{selectedGroup.ownerId}</strong></div>
                  <div className="detail-item"><div className="detail-key">Danh mục</div><strong>{selectedGroup.category}</strong></div>
                  <div className="detail-item"><div className="detail-key">Riêng tư</div><strong>{selectedGroup.privacy}</strong></div>
                  <div className="detail-item"><div className="detail-key">Ngày tạo</div><strong>{formatDateTime(selectedGroup.createdAt)}</strong></div>
                </div>
                <div className="mini-stat-grid">
                  <div className="mini-stat"><span>Tổng thành viên</span><strong>{formatNumber(selectedStats.totalMembers || selectedGroup.memberCount || 0)}</strong></div>
                  <div className="mini-stat"><span>Thành viên hoạt động</span><strong>{formatNumber(selectedStats.activeMembers || 0)}</strong></div>
                  <div className="mini-stat"><span>Thành viên bị cấm</span><strong>{formatNumber(selectedStats.bannedMembers || 0)}</strong></div>
                  <div className="mini-stat"><span>Điều phối viên</span><strong>{formatNumber(selectedStats.moderators || 0)}</strong></div>
                  <div className="mini-stat"><span>Tổng bài viết</span><strong>{formatNumber(selectedStats.totalPosts || 0)}</strong></div>
                  <div className="mini-stat"><span>Bài chờ duyệt</span><strong>{formatNumber(selectedStats.pendingPosts || 0)}</strong></div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
