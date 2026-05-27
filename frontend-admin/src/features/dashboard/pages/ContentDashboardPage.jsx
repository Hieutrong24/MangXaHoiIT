import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { pickMessage, toObject } from '../../../shared/utils/api';
import { formatNumber } from '../../../shared/utils/format';
import { contentAdminApi } from '../../../shared/utils/adminApi';
import PageHeader from '../../../shared/components/PageHeader.jsx';
import LoadingState from '../../../shared/components/LoadingState.jsx';
import StatCard from '../../../shared/components/StatCard.jsx';

export default function ContentDashboardPage() {
  const [dashboard, setDashboard] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await contentAdminApi.dashboard();
        if (!active) return;
        setDashboard(toObject(data));
      } catch (nextError) {
        if (!active) return;
        setError(pickMessage(nextError));
        setDashboard({});
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const posts = toObject(dashboard.posts);
  const comments = toObject(dashboard.comments);
  const groups = toObject(dashboard.groups);
  const overview = toObject(dashboard.overview);

  if (loading) return <LoadingState label="Đang tải trung tâm kiểm duyệt nội dung..." />;

  return (
    <div className="stack-lg">
      <PageHeader
        title="Vận hành nội dung"
        subtitle="Trung tâm kiểm duyệt cho bài viết, bình luận và cộng đồng với số liệu vận hành và lối vào nhanh đến các hàng đợi xử lý."
        icon="layers"
        actions={<Link className="btn btn-secondary" to="/content/posts">Mở hàng đợi duyệt</Link>}
      />

      {error ? <div className="alert alert-error">{error}</div> : null}

      <div className="stats-grid content-summary-grid compact-stat-grid">
        <StatCard label="Bài viết" value={overview.totalPosts || 0} icon="post" tone="info" hint="Bảng tin" />
        <StatCard label="Chờ kiểm duyệt" value={overview.pendingPosts || 0} icon="flag" tone="warning" hint="Hàng đợi" />
        <StatCard label="Bình luận" value={overview.totalComments || 0} icon="comment" tone="success" hint="Thảo luận" />
        <StatCard label="Cộng đồng" value={overview.totalGroups || 0} icon="community" tone="violet" hint="Nhóm" />
      </div>

      <div className="dashboard-grid">
        <div className="card section-card">
          <div className="section-title-row">
            <div>
              <div className="eyebrow">Kiểm duyệt bảng tin</div>
              <h3>Chất lượng bài viết và áp lực duyệt</h3>
            </div>
            <Link className="meta-chip" to="/content/posts">Quản lý bài viết</Link>
          </div>
          <div className="detail-grid">
            <div className="detail-item"><div className="detail-key">Bài trên bảng tin</div><strong>{formatNumber(posts.feedPosts || 0)}</strong></div>
            <div className="detail-item"><div className="detail-key">Bài trong nhóm</div><strong>{formatNumber(posts.groupPosts || 0)}</strong></div>
            <div className="detail-item"><div className="detail-key">Bài bị từ chối</div><strong>{formatNumber(posts.rejectedPosts || 0)}</strong></div>
            <div className="detail-item"><div className="detail-key">Mới trong 7 ngày</div><strong>{formatNumber(posts.recentPosts7d || 0)}</strong></div>
            <div className="detail-item"><div className="detail-key">Tổng lượt thích</div><strong>{formatNumber(posts.totalLikes || 0)}</strong></div>
            <div className="detail-item"><div className="detail-key">Tổng lượt chia sẻ</div><strong>{formatNumber(posts.totalShares || 0)}</strong></div>
          </div>
        </div>

        <div className="card section-card">
          <div className="section-title-row">
            <div>
              <div className="eyebrow">Sức khỏe cộng đồng</div>
              <h3>Nhóm và mức độ tương tác</h3>
            </div>
            <Link className="meta-chip" to="/content/groups">Mở danh sách nhóm</Link>
          </div>
          <div className="detail-grid">
            <div className="detail-item"><div className="detail-key">Nhóm công khai</div><strong>{formatNumber(groups.publicGroups || 0)}</strong></div>
            <div className="detail-item"><div className="detail-key">Nhóm riêng tư</div><strong>{formatNumber(groups.privateGroups || 0)}</strong></div>
            <div className="detail-item"><div className="detail-key">Thành viên</div><strong>{formatNumber(groups.totalMembers || 0)}</strong></div>
            <div className="detail-item"><div className="detail-key">Bài nhóm chờ duyệt</div><strong>{formatNumber(groups.pendingPosts || 0)}</strong></div>
            <div className="detail-item"><div className="detail-key">Bài trong nhóm</div><strong>{formatNumber(groups.totalPosts || 0)}</strong></div>
            <div className="detail-item"><div className="detail-key">Nhóm mới trong 30 ngày</div><strong>{formatNumber(groups.recentGroups30d || 0)}</strong></div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid-wide">
        <div className="card section-card">
          <div className="section-title-row">
            <div>
              <div className="eyebrow">Luồng bình luận</div>
              <h3>Khối lượng thảo luận</h3>
            </div>
            <Link className="meta-chip" to="/content/comments">Kiểm duyệt bình luận</Link>
          </div>
          <div className="mini-stat-grid">
            <div className="mini-stat"><span>Tổng bình luận</span><strong>{formatNumber(comments.totalComments || 0)}</strong></div>
            <div className="mini-stat"><span>Mới trong 7 ngày</span><strong>{formatNumber(comments.recentComments7d || 0)}</strong></div>
          </div>
        </div>
        <div className="card section-card">
          <div className="section-title-row">
            <div>
              <div className="eyebrow">Tác vụ nhanh</div>
              <h3>Lối tắt kiểm duyệt</h3>
            </div>
          </div>
          <div className="service-list">
            <Link className="stitch-nav-link" to="/content/posts"><span>Hàng đợi bài viết</span><small>Phê duyệt hoặc từ chối bài gửi trên feed và cộng đồng.</small></Link>
            <Link className="stitch-nav-link" to="/content/comments"><span>Dọn dẹp bình luận</span><small>Xử lý nhanh nội dung spam hoặc thảo luận vi phạm.</small></Link>
            <Link className="stitch-nav-link" to="/content/groups"><span>Giám sát cộng đồng</span><small>Kiểm tra quy mô, sức khỏe và áp lực thành viên của từng nhóm.</small></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
