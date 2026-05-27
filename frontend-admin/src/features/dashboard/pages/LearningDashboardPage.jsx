import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { pickMessage, toObject } from '../../../shared/utils/api';
import { formatNumber } from '../../../shared/utils/format';
import { learningAdminApi } from '../../../shared/utils/adminApi';
import PageHeader from '../../../shared/components/PageHeader.jsx';
import LoadingState from '../../../shared/components/LoadingState.jsx';
import StatCard from '../../../shared/components/StatCard.jsx';

export default function LearningDashboardPage() {
  const [dashboard, setDashboard] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await learningAdminApi.dashboard();
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

  const catalog = toObject(dashboard.catalog);
  const activity = toObject(dashboard.activity);

  if (loading) return <LoadingState label="Đang tải dashboard quản trị học tập..." />;

  return (
    <div className="stack-lg">
      <PageHeader
        title="Quản trị học tập"
        subtitle="Theo dõi danh mục học tập, hoạt động học viên, mức phủ thử thách và chất lượng quiz trong dashboard vận hành gọn hơn."
        icon="book"
        actions={<Link className="btn btn-secondary" to="/learning/catalog">Mở danh mục</Link>}
      />

      {error ? <div className="alert alert-error">{error}</div> : null}

      <div className="stats-grid content-summary-grid compact-stat-grid">
        <StatCard label="Lộ trình học" value={catalog.totalPaths || 0} icon="path" tone="info" hint="Danh mục" />
        <StatCard label="Bài học" value={catalog.totalLessons || 0} icon="lesson" tone="success" hint="Chương trình" />
        <StatCard label="Quiz" value={catalog.totalQuizzes || 0} icon="quiz" tone="violet" hint="Đánh giá" />
        <StatCard label="Thử thách" value={catalog.activeChallenges || 0} icon="challenge" tone="warning" hint="Đang mở" />
      </div>

      <div className="dashboard-grid">
        <div className="card section-card">
          <div className="section-title-row">
            <div>
              <div className="eyebrow">Mức phủ danh mục</div>
              <h3>Kho học tập đã công bố</h3>
            </div>
          </div>
          <div className="detail-grid">
            <div className="detail-item"><div className="detail-key">Lộ trình công khai</div><strong>{formatNumber(catalog.publicPaths || 0)}</strong></div>
            <div className="detail-item"><div className="detail-key">Bài học đã công bố</div><strong>{formatNumber(catalog.publishedLessons || 0)}</strong></div>
            <div className="detail-item"><div className="detail-key">Mục bài học</div><strong>{formatNumber(catalog.totalLessonItems || 0)}</strong></div>
            <div className="detail-item"><div className="detail-key">Quiz đã công bố</div><strong>{formatNumber(catalog.publishedQuizzes || 0)}</strong></div>
            <div className="detail-item"><div className="detail-key">Huy hiệu</div><strong>{formatNumber(catalog.totalBadges || 0)}</strong></div>
            <div className="detail-item"><div className="detail-key">Thử thách</div><strong>{formatNumber(catalog.totalChallenges || 0)}</strong></div>
          </div>
        </div>

        <div className="card section-card">
          <div className="section-title-row">
            <div>
              <div className="eyebrow">Hoạt động học viên</div>
              <h3>Sử dụng và điểm số</h3>
            </div>
          </div>
          <div className="detail-grid">
            <div className="detail-item"><div className="detail-key">Học viên</div><strong>{formatNumber(activity.totalLearners || 0)}</strong></div>
            <div className="detail-item"><div className="detail-key">Bài nộp</div><strong>{formatNumber(activity.totalSubmissions || 0)}</strong></div>
            <div className="detail-item"><div className="detail-key">Bài nộp gần đây</div><strong>{formatNumber(activity.recentSubmissions7d || 0)}</strong></div>
            <div className="detail-item"><div className="detail-key">Được chấp nhận</div><strong>{formatNumber(activity.acceptedSubmissions || 0)}</strong></div>
            <div className="detail-item"><div className="detail-key">Lượt làm quiz</div><strong>{formatNumber(activity.totalQuizAttempts || 0)}</strong></div>
            <div className="detail-item"><div className="detail-key">Điểm quiz trung bình</div><strong>{formatNumber(activity.averageQuizScore || 0)}</strong></div>
            <div className="detail-item"><div className="detail-key">XP đã cấp</div><strong>{formatNumber(activity.totalXpGranted || 0)}</strong></div>
            <div className="detail-item"><div className="detail-key">Huy hiệu đã trao</div><strong>{formatNumber(activity.awardedBadges || 0)}</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}
