import { useEffect, useMemo, useState } from 'react';
import { pickMessage, toArray } from '../../../shared/utils/api';
import { formatDateTime, formatNumber } from '../../../shared/utils/format';
import { contentAdminApi } from '../../../shared/utils/adminApi';
import PageHeader from '../../../shared/components/PageHeader.jsx';
import LoadingState from '../../../shared/components/LoadingState.jsx';
import EmptyState from '../../../shared/components/EmptyState.jsx';
import StatCard from '../../../shared/components/StatCard.jsx';
import AppIcon from '../../../shared/components/AppIcon.jsx';

function normalizeComment(item) {
  return {
    id: item?._id || item?.id,
    postId: item?.postId || '-',
    authorId: item?.authorId || '-',
    content: item?.content || '',
    createdAt: item?.createdAt || null,
  };
}

export default function CommentsModerationPage() {
  const [filters, setFilters] = useState({ keyword: '', postId: '', authorId: '', page: 1, pageSize: 20 });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await contentAdminApi.listComments(filters);
      setItems(toArray(data).map(normalizeComment));
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

  async function removeComment(comment) {
    if (!window.confirm('Xóa bình luận này khỏi nền tảng?')) return;
    setBusyId(comment.id);
    try {
      await contentAdminApi.deleteComment(comment.id);
      await load();
    } catch (nextError) {
      setError(pickMessage(nextError));
    } finally {
      setBusyId('');
    }
  }

  const stats = useMemo(() => ({
    total: items.length,
    uniquePosts: new Set(items.map((item) => item.postId)).size,
    uniqueAuthors: new Set(items.map((item) => item.authorId)).size,
  }), [items]);

  return (
    <div className="stack-lg">
      <PageHeader
        title="Kiểm duyệt bình luận"
        subtitle="Giữ thảo luận lành mạnh bằng cách rà soát bình luận, lọc theo bài viết hoặc tác giả, và xóa nội dung vi phạm nhanh chóng."
        icon="comment"
      />

      <div className="stats-grid stats-grid-tight compact-stat-grid">
        <StatCard label="Bình luận" value={stats.total} icon="comment" tone="info" hint="Thảo luận" />
        <StatCard label="Bài liên quan" value={stats.uniquePosts} icon="post" tone="success" hint="Phạm vi" />
        <StatCard label="Tác giả" value={stats.uniqueAuthors} icon="users" tone="violet" hint="Nguồn" />
      </div>

      <div className="card section-card">
        <form className="toolbar toolbar-rich" onSubmit={(event) => { event.preventDefault(); load(); }}>
          <div className="input-with-icon grow-2">
            <AppIcon name="search" size={16} />
            <input value={filters.keyword} onChange={(event) => setFilters((prev) => ({ ...prev, keyword: event.target.value }))} placeholder="Tìm nội dung bình luận" />
          </div>
          <input value={filters.postId} onChange={(event) => setFilters((prev) => ({ ...prev, postId: event.target.value }))} placeholder="ID bài viết" />
          <input value={filters.authorId} onChange={(event) => setFilters((prev) => ({ ...prev, authorId: event.target.value }))} placeholder="ID tác giả" />
          <button className="btn btn-primary"><AppIcon name="refresh" size={16} />Tải lại</button>
        </form>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <LoadingState label="Đang tải hàng đợi kiểm duyệt bình luận..." /> : null}
      {!loading && !items.length ? <EmptyState title="Không tìm thấy bình luận" description="Không có bình luận nào khớp với bộ lọc hiện tại." /> : null}

      {!loading && items.length ? (
        <div className="card section-card table-wrap">
          <div className="section-title-row">
            <div>
              <div className="eyebrow">Hàng đợi thảo luận</div>
              <h3>Danh sách bình luận</h3>
            </div>
            <div className="meta-chip">{formatNumber(items.length)} bản ghi</div>
          </div>
          <table className="table admin-table">
            <thead>
              <tr>
                <th>Bình luận</th>
                <th>Tác giả</th>
                <th>Bài viết</th>
                <th>Ngày tạo</th>
                <th>Tác vụ</th>
              </tr>
            </thead>
            <tbody>
              {items.map((comment) => (
                <tr key={comment.id}>
                  <td className="truncate-copy">{comment.content}</td>
                  <td><span className="code-inline">{comment.authorId}</span></td>
                  <td><span className="code-inline">{comment.postId}</span></td>
                  <td>{formatDateTime(comment.createdAt)}</td>
                  <td>
                    <button className="btn btn-danger" disabled={busyId === comment.id} onClick={() => removeComment(comment)}>
                      <AppIcon name="trash" size={16} />Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
