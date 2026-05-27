import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../features/auth/hooks/useAuth.jsx';
import AppIcon from '../../shared/components/AppIcon.jsx';

const navGroups = [
  {
    title: 'Overview',
    items: [
      { to: '/', label: 'Dashboard', shortLabel: 'Dash', icon: 'dashboard', note: 'Tổng quan hệ thống' },
      { to: '/users', label: 'Users', shortLabel: 'Users', icon: 'users', note: 'Danh sách thành viên' },
      { to: '/users/activity', label: 'Activity', shortLabel: 'Logs', icon: 'activity', note: 'Nhật ký hành vi' },
    ],
  },
  {
    title: 'Operations',
    items: [
    ],
  },
  {
    title: 'Code Judge',
    items: [
      { to: '/code/problems', label: 'Problems', shortLabel: 'Problems', icon: 'code', note: 'Ngân hàng bài tập' },
      { to: '/code/submissions', label: 'Submissions', shortLabel: 'Runs', icon: 'submissions', note: 'Hàng đợi chấm bài' },
    ],
  },
];

function layoutMeta(pathname) {
  if (pathname.startsWith('/code')) {
    return {
      panel: 'Judge Console',
      panelSub: 'Code Operations',
      brand: 'Admin Console',
      headline: 'Code review and submission workspace',
      chip: 'Judge mode',
    };
  }
  return {
    panel: 'Admin Core',
    panelSub: 'Social Network Ops',
    brand: 'Admin Console',
    headline: 'Central workspace for moderation and analytics',
    chip: 'Live workspace',
  };
}

function getInitials(user) {
  const source = user?.fullName || user?.username || 'Admin';
  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'A';
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const pathname = location.pathname;
  const meta = useMemo(() => layoutMeta(pathname), [pathname]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const sync = () => {
      if (window.innerWidth < 1100) {
        setSidebarCollapsed(false);
      } else if (window.innerWidth < 1480) {
        setSidebarCollapsed(true);
      }
    };
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const totalLinks = navGroups.reduce((acc, group) => acc + group.items.length, 0);

  return (
    <div className={`stitch-shell ${sidebarOpen ? 'sidebar-open' : ''} ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <header className="stitch-topbar">
        <div className="stitch-topbar-left">
          <button className="icon-btn mobile-only" onClick={() => setSidebarOpen((v) => !v)} aria-label="Mở menu">
            <AppIcon name="menu" size={18} />
          </button>
          <button className="icon-btn desktop-only" onClick={() => setSidebarCollapsed((v) => !v)} aria-label="Thu gọn menu">
            <AppIcon name={sidebarCollapsed ? 'menu' : 'activity'} size={18} />
          </button>
          <div className="brand-line brand-line-large">
            <div>
              <div className="brand-main">{meta.brand}</div>
              <div className="brand-subline">High-end editorial admin workspace</div>
            </div>
            <div className="brand-divider" />
            <div className="brand-context-wrap">
              <div className="brand-context">Architectural Social Network</div>
              <div className="brand-context-sub">{meta.headline}</div>
            </div>
            <div className="search-shell">
              <AppIcon name="search" size={16} />
              <input placeholder="Search users, problems..." />
            </div>
          </div>
        </div>
        <div className="stitch-topbar-right">
          <div className="top-status-chip"><span className="top-status-dot" />Realtime sync</div>
          <button className="icon-btn" aria-label="Thông báo"><AppIcon name="bell" size={18} /></button>
          <button className="icon-btn" aria-label="Tác vụ nhanh"><AppIcon name="spark" size={18} /></button>
          <div className="top-avatar">{getInitials(user)}</div>
        </div>
      </header>

      <aside className="stitch-sidebar">
        <div className="sidebar-brand-group">
          <div className="sidebar-brand-mark"><AppIcon name="spark" size={18} /></div>
          <div className="sidebar-brand-copy">
            <div className="sidebar-brand-title">{meta.panel}</div>
            <div className="sidebar-brand-sub">{meta.panelSub}</div>
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarCollapsed((v) => !v)} aria-label="Thu gọn sidebar">
            <AppIcon name="menu" size={16} />
          </button>
        </div>

        <div className="sidebar-insight-card">
          <div className="sidebar-insight-head">
            <span className="eyebrow">{meta.chip}</span>
            <span className="sidebar-mini-chip">{totalLinks} mục</span>
          </div>
          <strong>Curated operations with clearer hierarchy</strong>
          <p className="muted small">Bám style Stitch: tonal layering, headline mạnh, thẻ trắng, khoảng thở lớn và điều hướng gọn hơn.</p>
        </div>

        <div className="sidebar-section-stack">
          {navGroups.map((group) => (
            <div className="sidebar-nav-group" key={group.title}>
              <div className="sidebar-group-title">{sidebarCollapsed ? group.title.slice(0, 1) : group.title}</div>
              <nav className="stitch-nav-list">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) => `stitch-nav-item ${isActive ? 'active' : ''}`}
                    title={sidebarCollapsed ? item.label : `${item.label} - ${item.note}`}
                  >
                    <AppIcon name={item.icon} size={18} />
                    <div className="nav-copy">
                      <span>{sidebarCollapsed ? item.shortLabel : item.label}</span>
                      {!sidebarCollapsed ? <small>{item.note}</small> : null}
                    </div>
                  </NavLink>
                ))}
              </nav>
            </div>
          ))}
        </div>

        <div className="sidebar-bottom-links">
          <a className="stitch-nav-link" href="#"><AppIcon name="activity" size={17} /><div className="nav-copy"><span>{sidebarCollapsed ? 'Help' : 'Support Center'}</span>{!sidebarCollapsed ? <small>Hướng dẫn thao tác</small> : null}</div></a>
          <a className="stitch-nav-link" href="#"><AppIcon name="submissions" size={17} /><div className="nav-copy"><span>{sidebarCollapsed ? 'Docs' : 'Documentation'}</span>{!sidebarCollapsed ? <small>Quy trình và tài liệu</small> : null}</div></a>
        </div>

        <div className="sidebar-user-panel">
          <div className="sidebar-user-avatar">{getInitials(user)}</div>
          <div className="sidebar-user-copy">
            <strong>{user?.fullName || user?.username || 'Administrator'}</strong>
            <span>{user?.roles?.[0] || 'System operator'}</span>
          </div>
        </div>

        <button className="sidebar-cta" onClick={pathname === '/auth/login' ? undefined : logout}>
          <AppIcon name="logout" size={16} />
          <span>Đăng xuất</span>
        </button>
      </aside>

      {sidebarOpen ? <button className="sidebar-backdrop" aria-label="Đóng menu" onClick={() => setSidebarOpen(false)} /> : null}

      <main className="stitch-main">
        <Outlet />
      </main>
    </div>
  );
}
