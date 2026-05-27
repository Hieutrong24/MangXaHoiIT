import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { usersAdminApi } from '../../users/api/users.api';
import { jobsAdminApi } from '../../jobs/api/jobs.api';
import { codeAdminApi } from '../../code/api/code.api';
import { contentAdminApi, communicationAdminApi, learningAdminApi } from '../../../shared/utils/adminApi';
import { pickMessage, toArray, toObject } from '../../../shared/utils/api';
import { formatNumber } from '../../../shared/utils/format';
import StatCard from '../../../shared/components/StatCard.jsx';
import LoadingState from '../../../shared/components/LoadingState.jsx';
import { BarChart, DonutChart } from '../../../shared/components/BarChart.jsx';
import { ProgressColumns, SparklineCard } from '../../../shared/components/TrendCharts.jsx';
import StatusBadge from '../../../shared/components/StatusBadge.jsx';
import PageHeader from '../../../shared/components/PageHeader.jsx';

function resolveTotal(payload) {
  return payload?.data?.total ?? payload?.total ?? toArray(payload).length ?? 0;
}

function topActionsFromDashboard(dashboard) {
  return toArray(dashboard?.topActions)
    .map((item) => ({ label: item.action || item.name || 'Khác', value: item.count || 0 }))
    .filter((item) => item.value > 0)
    .slice(0, 6);
}

function sourceRows(summary) {
  return [
    { name: 'Người dùng', status: resolveTotal(summary.users) > 0 ? 'active' : 'unknown', detail: `${formatNumber(resolveTotal(summary.users))} tài khoản` },
    { name: 'Tuyển dụng', status: (summary.jobsDash?.totalJobs ?? summary.jobsDash?.jobCount ?? 0) >= 0 ? 'active' : 'unknown', detail: `${formatNumber(summary.jobsDash?.totalJobs ?? summary.jobsDash?.jobCount ?? 0)} tin tuyển dụng` },
    { name: 'Bài tập code', status: resolveTotal(summary.problems) > 0 || resolveTotal(summary.submissions) > 0 ? 'active' : 'unknown', detail: `${formatNumber(resolveTotal(summary.problems))} bài tập` },
  ];
}

function extendedSourceRows(summary) {
  return [
    ...sourceRows(summary),
    { name: 'Moderation', status: (summary.contentDash?.overview?.totalPosts ?? 0) > 0 ? 'active' : 'unknown', detail: `${formatNumber(summary.contentDash?.overview?.totalPosts ?? 0)} posts` },
    { name: 'Realtime', status: (summary.chatDash?.totalGroups ?? 0) > 0 ? 'active' : 'unknown', detail: `${formatNumber(summary.chatDash?.totalGroups ?? 0)} group chats` },
    { name: 'Learning', status: (summary.learningDash?.catalog?.totalPaths ?? 0) > 0 ? 'active' : 'unknown', detail: `${formatNumber(summary.learningDash?.catalog?.totalPaths ?? 0)} paths` },
  ];
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const [users, jobsDash, problems, submissions, activityDash, contentDash, chatDash, notificationsDash, learningDash] = await Promise.all([
          usersAdminApi.list({ page: 1, pageSize: 1 }),
          jobsAdminApi.dashboard(),
          codeAdminApi.listProblems({ page: 1, pageSize: 1 }),
          codeAdminApi.listSubmissions({ page: 1, pageSize: 1 }),
          usersAdminApi.activityDashboard({}),
          contentAdminApi.dashboard(),
          communicationAdminApi.chatDashboard(),
          communicationAdminApi.notificationsDashboard(),
          learningAdminApi.dashboard(),
        ]);
        if (!active) return;
        setSummary({
          users,
          jobsDash: toObject(jobsDash),
          problems,
          submissions,
          activityDash: toObject(activityDash),
          contentDash: toObject(contentDash),
          chatDash: toObject(chatDash),
          notificationsDash: toObject(notificationsDash),
          learningDash: toObject(learningDash),
        });
      } catch (error) {
        if (!active) return;
        setError(pickMessage(error));
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  const metrics = useMemo(() => {
    const jobsDash = toObject(summary.jobsDash);
    const activityDash = toObject(summary.activityDash);
    const contentDash = toObject(summary.contentDash);
    const chatDash = toObject(summary.chatDash);
    const notificationsDash = toObject(summary.notificationsDash);
    const learningDash = toObject(summary.learningDash);
    const totalUsers = resolveTotal(summary.users);
    const totalProblems = resolveTotal(summary.problems);
    const totalSubmissions = resolveTotal(summary.submissions);
    const totalJobs = jobsDash.totalJobs ?? jobsDash.jobCount ?? jobsDash.total ?? 0;
    const totalApplications = jobsDash.totalApplications ?? jobsDash.applicationCount ?? 0;
    const activeUsers = activityDash.totals?.activeUsers ?? activityDash.activeUsers ?? 0;
    return {
      totalUsers,
      totalProblems,
      totalSubmissions,
      totalJobs,
      totalApplications,
      activeUsers,
      jobsDash,
      activityDash,
      contentDash,
      chatDash,
      notificationsDash,
      learningDash,
    };
  }, [summary]);

  const verticalMetrics = useMemo(() => ([
    { label: 'Users', value: metrics.totalUsers },
    { label: 'Jobs', value: metrics.totalJobs },
    { label: 'Posts', value: metrics.contentDash?.overview?.totalPosts || 0 },
    { label: 'Chats', value: metrics.chatDash?.totalGroups || 0 },
    { label: 'Problems', value: metrics.totalProblems },
    { label: 'Paths', value: metrics.learningDash?.catalog?.totalPaths || 0 },
  ]), [metrics]);

  if (loading) return <LoadingState label="Đang tải bảng điều khiển quản trị..." />;

  return (
    <div className="stack-lg dashboard-command-page">
      <PageHeader
        title="Admin Command Center"
        subtitle="A full-spectrum overview for identity, moderation, hiring, realtime communication, and learning operations."
        icon="dashboard"
        actions={<Link className="btn btn-secondary" to="/content/dashboard">Open moderation center</Link>}
      />
      <div className="page-hero">
        <div>
          <h1 className="page-hero-title">Tổng quan hệ thống</h1>
          <p className="page-hero-subtitle">Bố cục rộng hơn để theo dõi đồng thời người dùng, tuyển dụng, code judge và mức độ vận hành chung của nền tảng mạng xã hội IT.</p>
        </div>
        <div className="page-hero-actions"><div className="toolbar"><button className="btn btn-secondary">Hôm nay</button><button className="btn btn-secondary">7 ngày</button><button className="btn btn-secondary">30 ngày</button></div></div>
      </div>
      {error ? <div className="alert alert-error">{error}</div> : null}

      <div className="stats-grid">
        <StatCard label="Total Users" value={metrics.totalUsers} icon="users" tone="info" hint="Overall" />
        <StatCard label="Active Jobs" value={metrics.totalJobs} icon="jobs" tone="violet" hint="Hiring" />
        <StatCard label="Problems" value={metrics.totalProblems} icon="code" tone="default" hint="Catalog" />
        <StatCard label="Submissions" value={metrics.totalSubmissions} icon="submissions" tone="warning" hint="Judge Flow" />
      </div>

      <div className="trend-grid">
        <SparklineCard title="Người dùng hoạt động" value={metrics.activeUsers} delta="+12%" points={[12, 18, 22, 20, 28, 30, 33]} />
        <SparklineCard title="Đơn ứng tuyển" value={metrics.totalApplications} delta="+8%" points={[4, 8, 10, 15, 14, 20, 24]} />
        <SparklineCard title="Phiên chấm bài" value={metrics.totalSubmissions} delta="Ổn định" points={[10, 14, 14, 18, 17, 21, 22]} />
      </div>

      <div className="dashboard-grid">
        <div className="card section-card dashboard-main-panel surface-soft">
          <div className="section-title-row">
            <div>
              <div className="eyebrow">Tình trạng dữ liệu</div>
              <h3>Tổng quan các phân hệ</h3>
            </div>
            <div className="meta-chip">Dữ liệu tổng hợp</div>
          </div>
          <div className="service-list">
            {extendedSourceRows(summary).map((item) => (
              <div className="service-row" key={item.name}>
                <div>
                  <strong>{item.name}</strong>
                  <div className="muted small">{item.detail}</div>
                </div>
                <StatusBadge value={item.status} />
              </div>
            ))}
          </div>
          <div className="insight-grid">
            <div className="sub-card">
              <div className="sub-card-title">Hành động user nổi bật</div>
              <BarChart items={topActionsFromDashboard(metrics.activityDash)} />
            </div>
            <div className="sub-card">
              <div className="sub-card-title">Tương quan tải hệ thống</div>
              <ProgressColumns items={verticalMetrics} />
            </div>
          </div>
        </div>

        <div className="card section-card donut-panel">
          <div className="section-title-row">
            <div>
              <div className="eyebrow">Hiệu suất realtime</div>
              <h3>Tỷ lệ user hoạt động</h3>
            </div>
          </div>
          <DonutChart value={metrics.activeUsers} total={metrics.totalUsers || 1} label="Active" sublabel={`${formatNumber(metrics.activeUsers)}/${formatNumber(metrics.totalUsers)} user`} />
          <div className="insight-foot-grid">
            <div className="mini-stat"><span>Applications</span><strong>{formatNumber(metrics.totalApplications)}</strong></div>
            <div className="mini-stat"><span>Problems</span><strong>{formatNumber(metrics.totalProblems)}</strong></div>
            <div className="mini-stat"><span>Jobs</span><strong>{formatNumber(metrics.totalJobs)}</strong></div>
            <div className="mini-stat"><span>Submissions</span><strong>{formatNumber(metrics.totalSubmissions)}</strong></div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid-wide">
        <div className="card section-card"><div className="section-title-row"><div><div className="eyebrow">Users</div><h3>Phân bố tài khoản</h3></div></div><ProgressColumns items={[{ label: 'Active', value: metrics.activeUsers }, { label: 'Passive', value: Math.max(metrics.totalUsers - metrics.activeUsers, 0) }, { label: 'Total', value: metrics.totalUsers }]} /></div>
        <div className="card section-card"><div className="section-title-row"><div><div className="eyebrow">Hiring</div><h3>Phễu tuyển dụng</h3></div></div><BarChart items={[{ label: 'Jobs', value: metrics.totalJobs }, { label: 'Apps', value: metrics.totalApplications }, { label: 'Published', value: metrics.jobsDash.publishedJobs ?? metrics.totalJobs }, { label: 'Open', value: metrics.jobsDash.openJobs ?? metrics.totalJobs }]} /></div>
        <div className="card section-card"><div className="section-title-row"><div><div className="eyebrow">Judge</div><h3>Tải code judge</h3></div></div><BarChart items={[{ label: 'Problems', value: metrics.totalProblems }, { label: 'Subs', value: metrics.totalSubmissions }, { label: 'Active users', value: metrics.activeUsers }]} /></div>
      </div>
    </div>
  );
}
