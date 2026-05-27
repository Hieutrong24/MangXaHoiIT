import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { jobsAdminApi } from '../api/jobs.api';
import { pickMessage, toArray, toObject } from '../../../shared/utils/api';
import { formatNumber } from '../../../shared/utils/format';
import LoadingState from '../../../shared/components/LoadingState.jsx';
import AppIcon from '../../../shared/components/AppIcon.jsx';

function HiringKpiCard({ label, value, icon, tone }) {
  return (
    <article className={`hiring-kpi-card tone-${tone}`}>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <i><AppIcon name={icon} size={26} /></i>
    </article>
  );
}

function HiringTrendCard({ title, value, badge, tone, bars }) {
  return (
    <article className="hiring-trend-card">
      <div>
        <h2>{title}</h2>
        <div>
          <strong>{value}</strong>
          <span className={`tone-${tone}`}>{badge}</span>
        </div>
      </div>
      <div className={`hiring-trend-bars tone-${tone}`} aria-hidden="true">
        {bars.map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}
      </div>
    </article>
  );
}

function HighlightJobs({ items }) {
  const normalized = items.length ? items : [
    { label: 'Frontend Developer', value: 0 },
    { label: 'Backend Engineer', value: 0 },
    { label: 'UI/UX Intern', value: 0 },
    { label: 'DevOps Engineer', value: 0 },
    { label: 'Data Analyst', value: 0 },
  ];
  const max = Math.max(...normalized.map((item) => item.value), 1);

  return (
    <div className="hiring-highlight-list">
      {normalized.slice(0, 5).map((item, index) => (
        <div className="hiring-highlight-row" key={`${item.label}-${index}`}>
          <div>
            <span>{item.label}</span>
            <b>{formatNumber(item.value)} tin</b>
          </div>
          <i><em style={{ width: `${Math.max((item.value / max) * 100, item.value ? 8 : 4)}%` }} /></i>
        </div>
      ))}
    </div>
  );
}

function HiringEfficiency({ totalJobs, publishedJobs, openJobs, totalApplications }) {
  const rate = totalJobs ? Math.round((publishedJobs / totalJobs) * 100) : 0;
  const circumference = 402;
  const dashOffset = circumference - (circumference * rate / 100);

  return (
    <article className="hiring-efficiency-card">
      <h2>Hiệu quả công bố</h2>
      <div className="hiring-donut">
        <svg viewBox="0 0 160 160" role="img" aria-label={`Tỷ lệ công bố ${rate}%`}>
          <circle cx="80" cy="80" r="64" />
          <circle cx="80" cy="80" r="64" strokeDasharray={circumference} strokeDashoffset={dashOffset} />
        </svg>
        <div>
          <strong>{rate}%</strong>
          <span>Công bố</span>
        </div>
      </div>
      <p>{formatNumber(publishedJobs)} / {formatNumber(totalJobs)} việc làm đã Public</p>
      <div className="hiring-efficiency-list">
        <section><i className="tone-primary" /><span>Đang mở</span><strong>{formatNumber(openJobs)}</strong></section>
        <section><i className="tone-success" /><span>Đã công bố</span><strong>{formatNumber(publishedJobs)}</strong></section>
        <section><i className="tone-tertiary" /><span>Ứng tuyển</span><strong>{formatNumber(totalApplications)}</strong></section>
      </div>
    </article>
  );
}

function HiringWeeklyChart() {
  return (
    <article className="hiring-weekly-card">
      <div className="hiring-weekly-bars" aria-hidden="true">
        {[
          ['T2', 25],
          ['T3', 45],
          ['T4', 75],
          ['T5', 95],
        ].map(([label, height]) => (
          <section key={label}>
            <i style={{ height: `${height}%` }} />
            <span>{label}</span>
          </section>
        ))}
      </div>
      <p>Biểu đồ tăng trưởng tin tuyển dụng theo tuần</p>
    </article>
  );
}

export default function JobsDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboard, setDashboard] = useState({});

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await jobsAdminApi.dashboard();
        if (!active) return;
        setDashboard(toObject(data));
      } catch (error) {
        if (active) setError(pickMessage(error));
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  const topJobs = useMemo(() => toArray(dashboard.topJobs)
    .map((item) => ({ label: item.title || item.name || 'Việc làm', value: item.applicationCount || item.totalApplications || item.views || 0 }))
    .slice(0, 6), [dashboard]);

  if (loading) return <LoadingState label="Đang tải dashboard tuyển dụng..." />;

  const totalJobs = dashboard.totalJobs ?? dashboard.jobCount ?? dashboard.total ?? 0;
  const totalApplications = dashboard.totalApplications ?? dashboard.applicationCount ?? 0;
  const openJobs = dashboard.openJobs ?? dashboard.activeJobs ?? 0;
  const publishedJobs = dashboard.publishedJobs ?? totalJobs;

  return (
    <main className="hiring-dashboard-page">
      <header className="hiring-dashboard-hero">
        <div>
          <div className="hiring-title-row">
            <i><AppIcon name="jobs" size={28} /></i>
            <h1>Bảng tuyển dụng</h1>
          </div>
          <p>Theo dõi khối lượng tin việc làm, tỷ lệ công bố và mức độ quan tâm của ứng viên.</p>
        </div>
        <Link className="hiring-primary-action" to="/jobs/new">
          <AppIcon name="plus" size={17} />
          Tạo tin mới
        </Link>
      </header>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <section className="hiring-kpi-grid" aria-label="Chỉ số tuyển dụng">
        <HiringKpiCard label="Tổng việc làm" value={formatNumber(totalJobs)} icon="jobs" tone="primary" />
        <HiringKpiCard label="Đơn ứng tuyển" value={formatNumber(totalApplications)} icon="submissions" tone="success" />
        <HiringKpiCard label="Đang mở" value={formatNumber(openJobs)} icon="dashboard" tone="tertiary" />
      </section>

      <section className="hiring-trend-grid" aria-label="Xu hướng tuyển dụng">
        <HiringTrendCard title="Việc làm đang mở" value={formatNumber(openJobs)} badge="Live" tone="primary" bars={[40, 60, 50, 80, 70, 90]} />
        <HiringTrendCard title="Việc làm đã công bố" value={formatNumber(publishedJobs)} badge="Hiển thị" tone="success" bars={[30, 45, 65, 55, 75, 85]} />
        <HiringTrendCard title="Đơn ứng tuyển" value={formatNumber(totalApplications)} badge="Nhu cầu" tone="tertiary" bars={[50, 40, 70, 60, 85, 100]} />
      </section>

      <section className="hiring-analysis-grid">
        <article className="hiring-highlight-card">
          <div className="hiring-card-heading">
            <h2>Việc làm nổi bật</h2>
            <Link to="/jobs">
              Chi tiết
              <AppIcon name="chevronRight" size={14} />
            </Link>
          </div>
          <HighlightJobs items={topJobs} />
          <div className="hiring-candidate-strip">
            <div className="hiring-avatar-stack" aria-hidden="true">
              <span>FE</span>
              <span>BE</span>
              <b>+{Math.min(totalApplications, 99)}</b>
            </div>
            <p>{formatNumber(totalApplications)} ứng viên đang chờ xét duyệt cho các vị trí này.</p>
          </div>
        </article>

        <aside className="hiring-side-stack">
          <HiringEfficiency totalJobs={totalJobs} publishedJobs={publishedJobs} openJobs={openJobs} totalApplications={totalApplications} />
          <HiringWeeklyChart />
        </aside>
      </section>
    </main>
  );

}
