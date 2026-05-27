import { useEffect, useMemo, useState } from 'react';
import { pickMessage, toArray } from '../../../shared/utils/api';
import { formatDateTime, formatNumber, humanizeKey } from '../../../shared/utils/format';
import { contentAdminApi } from '../../../shared/utils/adminApi';
import PageHeader from '../../../shared/components/PageHeader.jsx';
import LoadingState from '../../../shared/components/LoadingState.jsx';
import EmptyState from '../../../shared/components/EmptyState.jsx';
import StatusBadge from '../../../shared/components/StatusBadge.jsx';
import StatCard from '../../../shared/components/StatCard.jsx';
import AppIcon from '../../../shared/components/AppIcon.jsx';

function normalizePost(item) {
  return {
    id: item?._id || item?.id,
    title: item?.title || 'Bài viết chưa có tiêu đề',
    content: item?.content || '',
    authorId: item?.authorId || '-',
    postType: item?.postType || 'feed',
    moderationStatus: item?.moderationStatus || 'approved',
    groupId: item?.groupId || '',
    likeCount: item?.likeCount || 0,
    commentCount: item?.commentCount || 0,
    createdAt: item?.createdAt || null,
  };
}

export default function PostsModerationPage() {
  const [filters, setFilters] = useState({ keyword: '', moderationStatus: '', postType: '', page: 1, pageSize: 20 });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await contentAdminApi.listPosts(filters);
      setItems(toArray(data).map(normalizePost));
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

  async function moderate(post, moderationStatus) {
    const needsReason = moderationStatus === 'rejected';
    const rejectionReason = needsReason ? window.prompt('Lý do từ chối', 'Không đáp ứng quy tắc kiểm duyệt') || '' : '';
    setBusyId(post.id);
    try {
      await contentAdminApi.moderatePost(post.id, { moderationStatus, rejectionReason });
      await load();
    } catch (nextError) {
      setError(pickMessage(nextError));
    } finally {
      setBusyId('');
    }
  }

  const stats = useMemo(() => ({
    total: items.length,
    pending: items.filter((item) => item.moderationStatus === 'pending').length,
    rejected: items.filter((item) => item.moderationStatus === 'rejected').length,
    community: items.filter((item) => item.postType === 'group').length,
  }), [items]);

  return (
    <div className="stack-lg">
      <PageHeader
        title="Kiểm duyệt bài viết"
        subtitle="Rà soát bài viết trên bảng tin và cộng đồng với bố cục gọn cho tác vụ kiểm duyệt khối lượng lớn."
        icon="flag"
      />

      <div className="stats-grid content-summary-grid compact-stat-grid">
        <StatCard label="Bài đang hiển thị" value={stats.total} icon="post" tone="info" hint="Hàng đợi" />
        <StatCard label="Chờ duyệt" value={stats.pending} icon="flag" tone="warning" hint="Cần xem" />
        <StatCard label="Bị từ chối" value={stats.rejected} icon="trash" tone="danger" hint="Đã gỡ" />
        <StatCard label="Bài cộng đồng" value={stats.community} icon="community" tone="violet" hint="Nhóm" />
      </div>

      <div className="card section-card">
        <form className="toolbar toolbar-rich" onSubmit={(event) => { event.preventDefault(); load(); }}>
          <div className="input-with-icon grow-2">
            <AppIcon name="search" size={16} />
            <input value={filters.keyword} onChange={(event) => setFilters((prev) => ({ ...prev, keyword: event.target.value }))} placeholder="Tìm theo tiêu đề, nội dung, tác giả hoặc thẻ" />
          </div>
          <select value={filters.moderationStatus} onChange={(event) => setFilters((prev) => ({ ...prev, moderationStatus: event.target.value }))}>
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
          </select>
          <select value={filters.postType} onChange={(event) => setFilters((prev) => ({ ...prev, postType: event.target.value }))}>
            <option value="">Tất cả nguồn</option>
            <option value="feed">Bảng tin</option>
            <option value="group">Cộng đồng</option>
          </select>
          <button className="btn btn-primary"><AppIcon name="refresh" size={16} />Tải lại</button>
        </form>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <LoadingState label="Đang tải hàng đợi kiểm duyệt..." /> : null}
      {!loading && !items.length ? <EmptyState title="Không có bài viết trong hàng đợi" description="Thử đổi bộ lọc hoặc tải lại nguồn kiểm duyệt." /> : null}

      {!loading && items.length ? (
        <div className="card section-card table-wrap">
          <div className="section-title-row">
            <div>
              <div className="eyebrow">Hàng đợi duyệt</div>
              <h3>Danh sách bài viết</h3>
            </div>
            <div className="meta-chip">{formatNumber(items.length)} bản ghi</div>
          </div>
          <table className="table admin-table">
            <thead>
              <tr>
                <th>Bài viết</th>
                <th>Loại</th>
                <th>Trạng thái</th>
                <th>Tín hiệu</th>
                <th>Ngày tạo</th>
                <th>Tác vụ</th>
              </tr>
            </thead>
            <tbody>
              {items.map((post) => (
                <tr key={post.id}>
                  <td>
                    <div className="stack-xs">
                      <strong>{post.title}</strong>
                      <span className="muted small truncate-copy">{post.content.slice(0, 160) || 'Không có nội dung'}</span>
                      <span className="tiny code-inline">{post.authorId}{post.groupId ? ` - nhóm ${post.groupId}` : ''}</span>
                    </div>
                  </td>
                  <td>{humanizeKey(post.postType)}</td>
                  <td><StatusBadge value={post.moderationStatus} /></td>
                  <td>
                    <div className="stack-xs">
                      <span>{formatNumber(post.likeCount)} lượt thích</span>
                      <span className="muted small">{formatNumber(post.commentCount)} bình luận</span>
                    </div>
                  </td>
                  <td>{formatDateTime(post.createdAt)}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-secondary" disabled={busyId === post.id || post.moderationStatus === 'approved'} onClick={() => moderate(post, 'approved')}>
                        <AppIcon name="spark" size={16} />Duyệt
                      </button>
                      <button className="btn btn-danger" disabled={busyId === post.id || post.moderationStatus === 'rejected'} onClick={() => moderate(post, 'rejected')}>
                        <AppIcon name="trash" size={16} />Từ chối
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
