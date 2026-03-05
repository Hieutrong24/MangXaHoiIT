import { Link, useLocation } from "react-router-dom";
import { Bell, Search } from "lucide-react";
import Input from "./Input";
import { useAuth } from "../../features/auth/hooks/useAuth";

export default function Topbar() {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/60 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
        <div className="flex-1 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
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

        <Link
          to="/notifications"
          className={`rounded-xl border border-white/10 p-2 hover:bg-white/10 transition ${
            location.pathname === "/notifications" ? "bg-white/10" : "bg-white/5"
          }`}
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-slate-200" />
        </Link>

        <Link to={`/u/${user?.username || "me"}`} className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-white/10 grid place-items-center text-sm font-bold">
            {(user?.displayName || "U").slice(0, 1).toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-semibold">{user?.displayName || "Bạn"}</div>
            <div className="text-xs text-slate-400">@{user?.username || "sockio"}</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
