import { Link, NavLink } from "react-router-dom";
import {
  Bell,
  Code2,
  FileText,
  Hash,
  Home,
  Users,
  Menu,
  MessageCircle,
  PenLine,
  Plus,
  Settings,
  User,
} from "lucide-react";
import Brand from "./Brand";

function cx() {
  return Array.from(arguments)
    .flat()
    .filter(Boolean)
    .join(" ");
}

const navGroups = [
  {
    title: "Khám phá",
    items: [
      { to: "/feed", label: "Bảng tin", icon: Home },
      { to: "/posts", label: "Bài viết", icon: FileText },
      // { to: "/tags", label: "Chủ đề", icon: Hash },
      { to: "/community", label: "Cộng đồng", icon: Users },
      { to: "/code/learn", label: "Học lập trình", icon: Code2 },
      { to: "/chat", label: "Chat", icon: MessageCircle },
    ],
  },
  {
    title: "Cá nhân",
    items: [
      { to: "/notifications", label: "Thông báo", icon: Bell },
      { to: "/settings", label: "Cài đặt", icon: Settings },
      { to: "/me/edit", label: "Hồ sơ", icon: User },
    ],
  },
];

const railButtonClass =
  "grid place-items-center rounded-2xl border border-[color:var(--border-soft)] bg-[var(--surface-muted)] text-[var(--text-secondary)] transition hover:border-[color:var(--border-strong)] hover:bg-[var(--surface-card)] hover:text-[var(--text-primary)]";

function SidebarItem({ item, expanded, onNavigate }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      title={!expanded ? item.label : undefined}
      onClick={onNavigate}
      className={({ isActive }) =>
        cx(
          "group relative flex items-center overflow-hidden rounded-2xl transition-all duration-200",
          expanded
            ? "h-12 gap-3 px-3"
            : "mx-auto h-14 w-14 justify-center px-0",
          isActive
            ? "border-cyan-400/20 bg-[linear-gradient(90deg,rgba(34,211,238,0.16),rgba(59,130,246,0.10),rgba(168,85,247,0.10))] text-[var(--text-primary)] shadow-[0_10px_30px_rgba(34,211,238,0.10)]"
            : "border-[color:var(--border-soft)] text-[var(--text-muted)] hover:border-[color:var(--border-strong)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]"
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cx(
              "absolute left-0 top-2 bottom-2 w-1 rounded-r-full transition-all duration-200",
              isActive
                ? "bg-gradient-to-b from-cyan-400 via-sky-400 to-violet-400 shadow-[0_0_18px_rgba(34,211,238,0.55)]"
                : "bg-transparent"
            )}
          />

          <span
            className={cx(
              "grid h-9 w-9 shrink-0 place-items-center rounded-xl border transition-all duration-200",
              isActive
                ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                : "border-[color:var(--border-soft)] bg-[var(--surface-muted)] text-[var(--text-muted)] group-hover:border-[color:var(--border-strong)] group-hover:bg-[var(--surface-card)] group-hover:text-[var(--text-primary)]"
            )}
          >
            <Icon className="ui-icon" />
          </span>

          <span
            className={cx(
              "min-w-0 overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-200",
              expanded ? "w-auto opacity-100" : "w-0 opacity-0"
            )}
          >
            {item.label}
          </span>
        </>
      )}
    </NavLink>
  );
}

function SectionTitle({ children, expanded }) {
  return (
    <div
      className={cx(
        "px-3 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)] transition-all duration-200",
        expanded ? "opacity-100" : "pointer-events-none h-0 overflow-hidden p-0 opacity-0"
      )}
    >
      {children}
    </div>
  );
}

export default function Sidebar({
  desktopPinned,
  onTogglePinned,
  hovered,
  onHoverChange,
  mobileOpen,
  onCloseMobile,
}) {
  const expanded = mobileOpen || desktopPinned || hovered;

  const handleToggleMenu = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      onCloseMobile();
      return;
    }
    onTogglePinned();
  };

  return (
    <>
      <div
        className={cx(
          "fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-[3px] transition-opacity duration-200 lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onCloseMobile}
      />

      <aside
        onMouseEnter={() => {
          if (!desktopPinned) onHoverChange(true);
        }}
        onMouseLeave={() => {
          if (!desktopPinned) onHoverChange(false);
        }}
        className={cx(
          "ui-shell-panel fixed left-0 top-0 z-50 h-screen border-r text-[var(--text-secondary)] shadow-[0_24px_80px_rgba(2,6,23,0.35)] backdrop-blur-2xl transition-[width,transform] duration-300 ease-out",
          expanded ? "w-[280px]" : "w-[94px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(70%_60%_at_50%_0%,rgba(59,130,246,0.16),transparent_70%)]" />
          <div className="absolute inset-y-0 right-0 w-px bg-[color:var(--border-soft)]" />
        </div>

        <div className="relative flex h-full flex-col">
          <div className={cx("pb-3 pt-4", expanded ? "px-4" : "px-3")}>
            {expanded ? (
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1 overflow-hidden">
                  <Brand />
                </div>

                <button
                  type="button"
                  onClick={handleToggleMenu}
                  className={cx(railButtonClass, "h-11 w-11 shrink-0")}
                  aria-label={desktopPinned ? "Thu gọn sidebar" : "Mở rộng sidebar"}
                >
                  <Menu className="ui-icon" />
                </button>
              </div>
            ) : (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleToggleMenu}
                  className={cx(railButtonClass, "h-14 w-14")}
                  aria-label={desktopPinned ? "Thu gọn sidebar" : "Mở rộng sidebar"}
                >
                  <Menu className="ui-icon" />
                </button>
              </div>
            )}
          </div>

          <div className="px-3 pb-3">
            <Link
              to="/posts/new"
              onClick={onCloseMobile}
              title={!expanded ? "Tạo bài viết" : undefined}
              className={cx(
                "group flex items-center overflow-hidden rounded-full border border-[color:var(--border-soft)] bg-[var(--surface-muted)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-200 hover:border-cyan-400/20 hover:bg-[var(--surface-card)]",
                expanded
                  ? "h-14 w-full justify-start gap-3 px-4"
                  : "mx-auto h-14 w-14 justify-center px-0"
              )}
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-sky-500 via-blue-500 to-cyan-400 text-white shadow-[0_10px_24px_rgba(37,99,235,0.35)]">
                {expanded ? (
                  <PenLine className="ui-icon" />
                ) : (
                  <Plus className="ui-icon" />
                )}
              </span>

              <span
                className={cx(
                  "overflow-hidden whitespace-nowrap text-sm font-semibold text-[var(--text-primary)] transition-all duration-200",
                  expanded ? "w-auto opacity-100" : "w-0 opacity-0"
                )}
              >
                Tạo bài viết
              </span>
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 pb-4">
            {navGroups.map((group) => (
              <div key={group.title}>
                <SectionTitle expanded={expanded}>{group.title}</SectionTitle>

                <div className="space-y-1">
                  {group.items.map((item) => (
                    <SidebarItem
                      key={item.to}
                      item={item}
                      expanded={expanded}
                      onNavigate={onCloseMobile}
                    />
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="border-t border-[color:var(--border-soft)] p-3">
            <Link
              to="/me/edit"
              onClick={onCloseMobile}
              title={!expanded ? "Chỉnh sửa hồ sơ" : undefined}
              className={cx(
                "group flex items-center overflow-hidden rounded-2xl border border-[color:var(--border-soft)] bg-[var(--surface-muted)] transition-all duration-200 hover:border-[color:var(--border-strong)] hover:bg-[var(--surface-card)]",
                expanded
                  ? "gap-3 px-3 py-3"
                  : "mx-auto h-14 w-14 justify-center px-0 py-0"
              )}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-cyan-400/15 bg-cyan-400/10 text-cyan-200">
                <User className="ui-icon" />
              </span>

              <span
                className={cx(
                  "min-w-0 overflow-hidden transition-all duration-200",
                  expanded ? "w-full opacity-100" : "w-0 opacity-0"
                )}
              >
                <span className="block truncate text-sm font-semibold text-[var(--text-primary)]">
                  Chỉnh sửa hồ sơ
                </span>
                <span className="block truncate text-xs text-[var(--text-muted)]">
                  Tài khoản và thông tin cá nhân
                </span>
              </span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
