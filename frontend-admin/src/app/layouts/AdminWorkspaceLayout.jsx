import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../features/auth/hooks/useAuth.jsx';
import AppIcon from '../../shared/components/AppIcon.jsx';

const navGroups = [
  {
    title: 'Điều hành',
    items: [
      { to: '/', label: 'Trung tâm điều hành', shortLabel: 'Trang chủ', icon: 'dashboard', note: 'Tổng quan đa dịch vụ và nhịp vận hành hệ thống.' },
    ],
  },
  {
    title: 'Danh tính',
    items: [
      { to: '/users', label: 'Danh mục người dùng', shortLabel: 'User', icon: 'users', note: 'Hồ sơ, trạng thái và vòng đời thành viên.' },
      { to: '/users/activity', label: 'Hoạt động người dùng', shortLabel: 'Log', icon: 'activity', note: 'Dòng thời gian hành vi và thao tác gần đây.' },
      { to: '/security/accounts', label: 'Kiểm soát truy cập', shortLabel: 'Truy cập', icon: 'shield', note: 'Tài khoản, trạng thái khóa và vai trò.' },
      { to: '/security/audit', label: 'Nhật ký kiểm tra', shortLabel: 'Audit', icon: 'fileText', note: 'Sự kiện xác thực và phân quyền.' },
    ],
  },
  {
    title: 'Kiểm duyệt',
    items: [
      { to: '/content/dashboard', label: 'Trung tâm nội dung', shortLabel: 'Nội dung', icon: 'layers', note: 'Bài viết, bình luận và sức khỏe nhóm.' },
      { to: '/content/posts', label: 'Duyệt bài viết', shortLabel: 'Bài viết', icon: 'post', note: 'Phê duyệt hoặc từ chối bài gửi.' },
      { to: '/content/comments', label: 'Duyệt bình luận', shortLabel: 'Bình luận', icon: 'comment', note: 'Dọn dẹp spam và nội dung xúc phạm.' },
      { to: '/content/groups', label: 'Duyệt cộng đồng', shortLabel: 'Nhóm', icon: 'community', note: 'Kiểm tra và quản lý cộng đồng trên nền tảng.' },
    ],
  },
  {
    title: 'Vận hành',
    items: [
      { to: '/communication/chat', label: 'Vận hành chat', shortLabel: 'Chat', icon: 'chat', note: 'Kiểm duyệt hội thoại nhóm và tin nhắn.' },
      { to: '/communication/notifications', label: 'Thông báo', shortLabel: 'Notify', icon: 'megaphone', note: 'Phát đi, giao nhận và luồng người nhận.' },
      { to: '/jobs/dashboard', label: 'Bảng tuyển dụng', shortLabel: 'Jobs', icon: 'jobs', note: 'Theo dõi tin tuyển dụng, việc đang mở và ứng tuyển.' },
      { to: '/jobs', label: 'Quản lý tuyển dụng', shortLabel: 'Tin', icon: 'fileText', note: 'Tạo, sửa, xóa tin tuyển dụng và xem pipeline ứng tuyển.' },
    ],
  },
  {
    title: 'Học tập',
    items: [
      { to: '/learning/dashboard', label: 'Tổng quan học tập', shortLabel: 'Học', icon: 'book', note: 'Lộ trình, bài kiểm tra, huy hiệu và tín hiệu tiến độ.' },
      { to: '/learning/catalog', label: 'Danh mục học tập', shortLabel: 'Mục lục', icon: 'path', note: 'Duyệt lộ trình, bài học, bài kiểm tra và thử thách.' },
      { to: '/code/problems', label: 'Ngân hàng bài tập', shortLabel: 'Bài tập', icon: 'code', note: 'Bài lập trình và dữ liệu kiểm thử.' },
      { to: '/code/submissions', label: 'Hàng chờ bài nộp', shortLabel: 'Bài nộp', icon: 'submissions', note: 'Kết quả chấm và rà soát thực thi.' },
    ],
  },
];

function layoutMeta(pathname) {
  if (pathname.startsWith('/security') || pathname.startsWith('/users')) {
    return {
      panel: 'Điều phối danh tính',
      panelSub: 'Tài khoản và quản trị',
      brand: 'IT Social Admin',
      headline: 'Không gian vận hành cho danh tính, phân quyền và an toàn thành viên.',
      chip: 'Trọng tâm danh tính',
      searchPlaceholder: 'Tìm người dùng, tài khoản hoặc nhật ký kiểm tra...',
    };
  }
  if (pathname.startsWith('/content')) {
    return {
      panel: 'Bàn kiểm duyệt',
      panelSub: 'Nội dung và cộng đồng',
      brand: 'IT Social Admin',
      headline: 'Kiểm soát chất lượng bài viết, bình luận và nhóm cộng đồng.',
      chip: 'Trọng tâm kiểm duyệt',
      searchPlaceholder: 'Tìm bài viết, bình luận hoặc cộng đồng...',
    };
  }
  if (pathname.startsWith('/communication') || pathname.startsWith('/jobs')) {
    return {
      panel: 'Vận hành thời gian thực',
      panelSub: pathname.startsWith('/jobs') ? 'Tuyển dụng và ứng tuyển' : 'Chat và thông báo',
      brand: 'IT Social Admin',
      headline: pathname.startsWith('/jobs')
        ? 'Quản lý tin tuyển dụng, trạng thái công bố và pipeline ứng tuyển.'
        : 'Vận hành chất lượng tin nhắn, phát thông báo và theo dõi khả năng giao nhận.',
      chip: pathname.startsWith('/jobs') ? 'Trọng tâm tuyển dụng' : 'Trọng tâm liên lạc',
      searchPlaceholder: pathname.startsWith('/jobs')
        ? 'Tìm tin tuyển dụng, công ty hoặc ứng viên...'
        : 'Tìm đoạn chat, tin nhắn hoặc thông báo...',
    };
  }
  if (pathname.startsWith('/learning') || pathname.startsWith('/code')) {
    return {
      panel: 'Bảng học tập',
      panelSub: 'Học tập và chấm bài',
      brand: 'IT Social Admin',
      headline: 'Quản lý nội dung học tập, danh mục luyện tập và luồng chấm bài code.',
      chip: 'Trọng tâm học tập',
      searchPlaceholder: 'Tìm lộ trình, bài kiểm tra, bài tập hoặc bài nộp...',
    };
  }
  return {
    panel: 'Trung tâm điều hành',
    panelSub: 'Vận hành nền tảng',
    brand: 'IT Social Admin',
    headline: 'Phòng điều hành tập trung cho nền tảng mạng xã hội IT.',
    chip: 'Nền tảng trực tuyến',
    searchPlaceholder: 'Tìm người dùng, bài viết hoặc bài tập...',
  };
}

function getInitials(user) {
  const source = user?.fullName || user?.username || 'Quản trị';
  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'A';
}

export default function AdminWorkspaceLayout() {
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
          <button className="icon-btn mobile-only" onClick={() => setSidebarOpen((value) => !value)} aria-label="Mở menu">
            <AppIcon name="menu" size={18} />
          </button>
          <button className="icon-btn desktop-only" onClick={() => setSidebarCollapsed((value) => !value)} aria-label="Thu gọn menu">
            <AppIcon name={sidebarCollapsed ? 'menu' : 'activity'} size={18} />
          </button>
          <div className="brand-line brand-line-large">
            <div>
              <div className="brand-main">{meta.brand}</div>
              <div className="brand-subline">Quản trị vận hành cho nền tảng IT Social</div>
            </div>
            <div className="brand-divider" />
            <div className="brand-context-wrap">
              <div className="brand-context">{meta.panel}</div>
              <div className="brand-context-sub">{meta.headline}</div>
            </div>
            <div className="search-shell">
              <AppIcon name="search" size={16} />
              <input placeholder={meta.searchPlaceholder} />
            </div>
          </div>
        </div>
        <div className="stitch-topbar-right">
          <div className="top-status-chip"><span className="top-status-dot" />Đồng bộ trực tuyến</div>
          <Link className="icon-btn" to="/communication/notifications" aria-label="Thông báo"><AppIcon name="bell" size={18} /></Link>
          <Link className="icon-btn" to="/" aria-label="Về command center"><AppIcon name="spark" size={18} /></Link>
          <div className="top-avatar">{getInitials(user)}</div>
        </div>
      </header>

      <aside className="stitch-sidebar">
        <div className="sidebar-brand-group">
          <div className="sidebar-brand-mark"><AppIcon name="shield" size={18} /></div>
          <div className="sidebar-brand-copy">
            <div className="sidebar-brand-title">{meta.panel}</div>
            <div className="sidebar-brand-sub">{meta.panelSub}</div>
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarCollapsed((value) => !value)} aria-label="Thu gọn menu">
            <AppIcon name="menu" size={16} />
          </button>
        </div>

        <div className="sidebar-insight-card">
          <div className="sidebar-insight-head">
            <span className="eyebrow">{meta.chip}</span>
            <span className="sidebar-mini-chip">{totalLinks} mục</span>
          </div>
          <strong>Lối vào nhanh cho từng phân hệ</strong>
          <p className="muted small">Danh tính, kiểm duyệt, vận hành, học tập và chấm bài được nhóm theo đúng ngữ cảnh công việc.</p>
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
          <Link className="stitch-nav-link" to="/">
            <AppIcon name="activity" size={17} />
            <div className="nav-copy">
              <span>{sidebarCollapsed ? 'Live' : 'Giám sát trực tiếp'}</span>
              {!sidebarCollapsed ? <small>Dùng dashboard để theo dõi tình trạng toàn bộ dịch vụ.</small> : null}
            </div>
          </Link>
          <Link className="stitch-nav-link" to="/security/audit">
            <AppIcon name="fileText" size={17} />
            <div className="nav-copy">
              <span>{sidebarCollapsed ? 'Tài liệu' : 'Ghi chú vận hành'}</span>
              {!sidebarCollapsed ? <small>Lịch sử kiểm tra, bằng chứng và quy trình nội bộ.</small> : null}
            </div>
          </Link>
        </div>

        <div className="sidebar-user-panel">
          <div className="sidebar-user-avatar">{getInitials(user)}</div>
          <div className="sidebar-user-copy">
            <strong>{user?.fullName || user?.username || 'Quản trị viên'}</strong>
            <span>{user?.roles?.[0] || 'Điều hành hệ thống'}</span>
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
