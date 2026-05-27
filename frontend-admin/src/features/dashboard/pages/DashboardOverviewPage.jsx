import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { usersAdminApi } from '../../users/api/users.api';
import { codeAdminApi } from '../../code/api/code.api';
import { contentAdminApi, communicationAdminApi, learningAdminApi } from '../../../shared/utils/adminApi';
import { pickMessage, toArray, toObject } from '../../../shared/utils/api';
import { formatNumber } from '../../../shared/utils/format';
import LoadingState from '../../../shared/components/LoadingState.jsx';
import { BarChart, DonutChart } from '../../../shared/components/BarChart.jsx';
import AppIcon from '../../../shared/components/AppIcon.jsx';

function resolveTotal(payload) {
  return payload?.data?.total ?? payload?.total ?? toArray(payload).length ?? 0;
}

function buildServiceRows(summary) {
  return [
    {
      name: 'Người dùng',
      short: 'Users',
      value: resolveTotal(summary.users),
      detail: `${formatNumber(resolveTotal(summary.users))} hồ sơ`,
      status: resolveTotal(summary.users) ? 'active' : 'unknown',
    },
    {
      name: 'Kiểm duyệt',
      short: 'Moderation',
      value: summary.contentDash?.overview?.pendingPosts ?? 0,
      detail: `${formatNumber(summary.contentDash?.overview?.pendingPosts ?? 0)} bài chờ xử lý`,
      status: (summary.contentDash?.overview?.totalPosts ?? 0) ? 'active' : 'unknown',
    },
    {
      name: 'Chat',
      short: 'Chat',
      value: summary.chatDash?.totalGroups ?? 0,
      detail: `${formatNumber(summary.chatDash?.totalGroups ?? 0)} nhóm hội thoại`,
      status: (summary.chatDash?.totalGroups ?? 0) ? 'active' : 'unknown',
    },
    {
      name: 'Học tập',
      short: 'Learning',
      value: summary.learningDash?.catalog?.totalPaths ?? 0,
      detail: `${formatNumber(summary.learningDash?.catalog?.totalPaths ?? 0)} lộ trình`,
      status: (summary.learningDash?.catalog?.totalPaths ?? 0) ? 'active' : 'unknown',
    },
    {
      name: 'Code judge',
      short: 'Judge',
      value: resolveTotal(summary.submissions),
      detail: `${formatNumber(resolveTotal(summary.submissions))} lượt nộp bài`,
      status: resolveTotal(summary.problems) || resolveTotal(summary.submissions) ? 'active' : 'unknown',
    },
  ];
}

function actionBars(activityDash) {
  return toArray(activityDash?.topActions)
    .map((item) => ({
      label: item.action || item.name || 'Khác',
      value: item.count || 0,
    }))
    .filter((item) => item.value > 0)
    .slice(0, 6);
}

function CommandKpiCard({ hint, label, value, icon, tone = 'teal' }) {
  return (
    <article className={`command-kpi-card tone-${tone}`}>
      <div className="command-kpi-head">
        <span className="command-kpi-tag">{hint}</span>
        <span className="command-kpi-icon"><AppIcon name={icon} size={18} /></span>
      </div>
      <div>
        <p>{label}</p>
        <strong>{formatNumber(value ?? 0)}</strong>
      </div>
    </article>
  );
}

function CommandTrendCard({ title, value, delta, tone = 'teal', bars = [] }) {
  const safeBars = bars.length ? bars : [35, 58, 44, 76, 66, 92];
  return (
    <article className={`command-trend-card tone-${tone}`}>
      <div>
        <p>{title}</p>
        <div className="command-trend-value">
          <strong>{formatNumber(value ?? 0)}</strong>
          <span>{delta}</span>
        </div>
      </div>
      <div className="command-mini-bars" aria-hidden="true">
        {safeBars.map((height, index) => <i key={`${title}-${index}`} style={{ height: `${height}%` }} />)}
      </div>
    </article>
  );
}

function CommandServiceTile({ item }) {
  return (
    <div className="command-service-tile">
      <span>{item.short}</span>
      <div>
        <strong>{formatNumber(item.value || 0)}</strong>
        <i aria-hidden="true" className={item.status === 'active' ? 'is-active' : ''} />
      </div>
    </div>
  );
}

function CommandColumnChart({ items }) {
  const max = Math.max(...items.map((item) => Number(item.value) || 0), 1);
  return (
    <div className="command-column-chart">
      {items.map((item) => {
        const value = Number(item.value) || 0;
        return (
          <div className="command-column-item" key={item.label}>
            <i style={{ height: `${Math.max((value / max) * 100, value > 0 ? 12 : 4)}%` }} />
            <span>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function CommandBottomCard({ eyebrow, title, to, linkLabel, icon, tone = 'teal', children }) {
  return (
    <section className={`command-bottom-card tone-${tone}`}>
      <div className="command-bottom-card-head">
        <span><AppIcon name={icon} size={18} /></span>
        <Link to={to}>{linkLabel}</Link>
      </div>
      <p>{eyebrow}</p>
      <h3>{title}</h3>
      {children}
    </section>
  );
}

export default function DashboardOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState({});

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const [users, problems, submissions, activityDash, contentDash, chatDash, notificationsDash, learningDash] = await Promise.all([
          usersAdminApi.list({ page: 1, pageSize: 1 }),
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
          problems,
          submissions,
          activityDash: toObject(activityDash),
          contentDash: toObject(contentDash),
          chatDash: toObject(chatDash),
          notificationsDash: toObject(notificationsDash),
          learningDash: toObject(learningDash),
        });
      } catch (nextError) {
        if (!active) return;
        setError(pickMessage(nextError));
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const metrics = useMemo(() => {
    const contentDash = toObject(summary.contentDash);
    const chatDash = toObject(summary.chatDash);
    const notificationsDash = toObject(summary.notificationsDash);
    const learningDash = toObject(summary.learningDash);
    const activityDash = toObject(summary.activityDash);

    return {
      totalUsers: resolveTotal(summary.users),
      totalProblems: resolveTotal(summary.problems),
      totalSubmissions: resolveTotal(summary.submissions),
      activeUsers: activityDash.totals?.activeUsers ?? activityDash.activeUsers ?? 0,
      pendingPosts: contentDash.overview?.pendingPosts ?? 0,
      totalPosts: contentDash.overview?.totalPosts ?? 0,
      totalComments: contentDash.overview?.totalComments ?? 0,
      totalGroups: contentDash.overview?.totalGroups ?? 0,
      totalChats: chatDash.totalGroups ?? 0,
      totalNotifications: notificationsDash.totalNotifications ?? 0,
      totalPaths: learningDash.catalog?.totalPaths ?? 0,
      activityDash,
      contentDash,
      chatDash,
      learningDash,
    };
  }, [summary]);

  const serviceRows = useMemo(() => buildServiceRows(summary), [summary]);
  const progressColumns = useMemo(() => ([
    { label: 'Users', value: metrics.totalUsers },
    { label: 'Posts', value: metrics.totalPosts },
    { label: 'Chats', value: metrics.totalChats },
    { label: 'Paths', value: metrics.totalPaths },
    { label: 'Problems', value: metrics.totalProblems },
  ]), [metrics]);

  const actionPressure = useMemo(() => {
    const actions = actionBars(metrics.activityDash);
    return actions.length ? actions : [
      { label: 'Login', value: metrics.activeUsers },
      { label: 'Submit Code', value: metrics.totalSubmissions },
      { label: 'Comment', value: metrics.totalComments },
    ].filter((item) => item.value > 0);
  }, [metrics]);

  if (loading) return <LoadingState label="Đang tải trung tâm điều hành..." />;

  return (
    <main className="admin-command-stitch">
      <header className="command-hero-v3">
        <div>
          <h1>Admin Command Center</h1>
          <p>Tổng quan vận hành cho người dùng, kiểm duyệt, chat, học tập và code judge trên IT Social.</p>
        </div>
        <div className="command-hero-actions">
          <Link className="command-ghost-action" to="/communication/notifications">Gửi thông báo</Link>
          <Link className="command-primary-action" to="/content/dashboard">Kiểm duyệt</Link>
        </div>
      </header>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <section className="command-priority-v3">
        <div className="command-priority-copy">
          <span><AppIcon name="flag" size={14} />Ưu tiên hôm nay</span>
          <h2>{formatNumber(metrics.pendingPosts)} bài viết đang chờ kiểm duyệt</h2>
          <p>Đây là hàng đợi có tác động trực tiếp đến trải nghiệm cộng đồng. Các chỉ số còn lại được gom theo từng phân hệ để giảm nhiễu khi quét nhanh.</p>
          <div>
            <Link className="command-primary-action" to="/content/posts">Xem hàng đợi</Link>
            <Link className="command-text-action" to="/security/audit">Kiểm tra audit</Link>
          </div>
        </div>
        <div className="command-priority-visual" aria-hidden="true">
          {[42, 64, 92, 56, 34].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}
        </div>
      </section>

      <section className="command-kpi-grid">
        <CommandKpiCard hint="Identity" label="Người dùng" value={metrics.totalUsers} icon="users" tone="blue" />
        <CommandKpiCard hint="Moderation" label="Bài chờ duyệt" value={metrics.pendingPosts} icon="flag" tone="amber" />
        <CommandKpiCard hint="Judge" label="Lượt nộp bài" value={metrics.totalSubmissions} icon="code" tone="teal" />
      </section>

      <section className="command-trend-grid-v3">
        <CommandTrendCard title="Người dùng hoạt động" value={metrics.activeUsers} delta="Live" tone="green" bars={[40, 60, 52, 78, 70, 100]} />
        <CommandTrendCard title="Thông báo" value={metrics.totalNotifications} delta="Delivery" tone="violet" bars={[72, 50, 92, 86]} />
      </section>

      <section className="command-main-grid-v3">
        <div className="command-system-card">
          <div className="command-card-heading">
            <div>
              <span>Bản đồ hệ thống</span>
              <h2>Tình trạng các phân hệ</h2>
            </div>
            <b>Cross-service</b>
          </div>

          <div className="command-service-grid">
            {serviceRows.map((item) => <CommandServiceTile key={item.name} item={item} />)}
          </div>

          <div className="command-analysis-stack">
            <section>
              <h3>Áp lực hành động của user</h3>
              <BarChart items={actionPressure} emptyLabel="Chưa có hành động nổi bật" compact />
            </section>
            <section>
              <h3>Dấu chân hệ thống</h3>
              <CommandColumnChart items={progressColumns} />
            </section>
          </div>
        </div>

        <aside className="command-health-stack">
          <div className="command-health-card">
            <h2>Tỷ lệ hoạt động</h2>
            <DonutChart
              value={metrics.activeUsers}
              total={metrics.totalUsers || 1}
              label="Active"
              sublabel={`${formatNumber(metrics.activeUsers)} / ${formatNumber(metrics.totalUsers)} người dùng`}
            />
            <div className="command-health-stats">
              <div><span>Chats</span><strong>{formatNumber(metrics.totalChats)}</strong></div>
              <div><span>Paths</span><strong>{formatNumber(metrics.totalPaths)}</strong></div>
              <div><span>Problems</span><strong>{formatNumber(metrics.totalProblems)}</strong></div>
              <div><span>Posts</span><strong>{formatNumber(metrics.totalPosts)}</strong></div>
            </div>
          </div>

          <div className="command-insight-visual">
            <span>Hệ thống</span>
            <h3>Phân tích chuyên sâu</h3>
            <p>Nhận báo cáo hiệu năng và bảo mật hàng tuần tự động.</p>
          </div>
        </aside>
      </section>

      <section className="command-bottom-grid-v3">
        <CommandBottomCard eyebrow="Identity" title="Chia tách hoạt động thành viên" to="/security/accounts" linkLabel="Quản lý truy cập" icon="shield" tone="blue">
          <CommandColumnChart
            items={[
              { label: 'Active', value: metrics.activeUsers },
              { label: 'Passive', value: Math.max(metrics.totalUsers - metrics.activeUsers, 0) },
              { label: 'Total', value: metrics.totalUsers },
            ]}
          />
        </CommandBottomCard>

        <CommandBottomCard eyebrow="Moderation" title="Khối lượng kiểm duyệt nội dung" to="/content/posts" linkLabel="Duyệt bài" icon="flag" tone="amber">
          <BarChart
            compact
            items={[
              { label: 'Posts', value: metrics.totalPosts },
              { label: 'Pending', value: metrics.pendingPosts },
              { label: 'Comments', value: metrics.totalComments },
              { label: 'Groups', value: metrics.totalGroups },
            ]}
          />
        </CommandBottomCard>

        <CommandBottomCard eyebrow="Learning" title="Kho học tập và code judge" to="/learning/catalog" linkLabel="Mở catalog" icon="book" tone="violet">
          <BarChart
            compact
            items={[
              { label: 'Paths', value: metrics.totalPaths },
              { label: 'Problems', value: metrics.totalProblems },
              { label: 'Submissions', value: metrics.totalSubmissions },
              { label: 'Chats', value: metrics.totalChats },
            ]}
          />
        </CommandBottomCard>
      </section>
    </main>
  );
}
