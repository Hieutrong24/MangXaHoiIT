import { Link, useLocation } from "react-router-dom";
import { Bell, Search } from "lucide-react";
import Input from "./Input";
import { useAuth } from "../../features/auth/hooks/useAuth";

export default function Topbar() {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/85 backdrop-blur-2xl supports-[backdrop-filter]:bg-slate-950/70">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 py-3 sm:px-4">
        <div className="hidden min-w-0 flex-1 md:block">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              placeholder="Tìm bài viết, tag, người dùng..."
              className="pl-9"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const q = e.currentTarget.value?.trim();
                  if (q) window.location.href = `/search?q=${encodeURIComponent(q)}`;
                }
              }}
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <Link
            to="/notifications"
            className={`grid h-11 w-11 place-items-center rounded-2xl border transition-all duration-200 ${
              location.pathname === "/notifications"
                ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-200"
                : "border-white/10 bg-slate-900/80 text-slate-300 hover:border-white/15 hover:bg-slate-800/80 hover:text-white"
            }`}
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </Link>

          <Link
            to={`/u/${user?.username || "me"}`}
            className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-2.5 py-2 transition-all duration-200 hover:border-white/15 hover:bg-slate-800/80"
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 text-sm font-bold text-slate-100 shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
              {(user?.displayName || "U").slice(0, 1).toUpperCase()}
            </div>
            <div className="hidden min-w-0 sm:block leading-tight">
              <div className="truncate text-sm font-semibold text-white">{user?.displayName || "Bạn"}</div>
              <div className="truncate text-xs text-slate-400">@{user?.username || "sockio"}</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
