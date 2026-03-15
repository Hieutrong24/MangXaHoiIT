import { Link, useLocation } from "react-router-dom";
import { Bell, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Input from "./Input";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { http } from "../../services/http";

function buildFallbackAvatar(seed) {
  const s = seed || "me";
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(s)}`;
}

export default function Header() {
  const { user } = useAuth();
  const location = useLocation();

  const userId = useMemo(() => user?.userId || localStorage.getItem("userId") || null, [user?.userId]);

  const [me, setMe] = useState(null);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    let alive = true;

    async function load() {
      if (!userId) {
        setMe(null);
        return;
      }
      try {
        const res = await http.get(`/users/${encodeURIComponent(userId)}`);
        const data = res.data?.data ?? res.data;
        if (alive) setMe(data);
      } catch {
        if (alive) setMe(null);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [userId]);

  useEffect(() => {
    setAvatarError(false);
  }, [me?.avatarUrl, user?.avatarUrl, me?.username, user?.username, me?.userId, user?.userId]);

  const fullName =
    me?.fullName || user?.fullName || user?.displayName || me?.username || user?.username || "Bạn";

  const email = me?.tdmuEmail || user?.tdmuEmail || "";

  const username = me?.username || user?.username || "";
  const avatarUrlRaw = me?.avatarUrl || user?.avatarUrl || "";
  const fallbackAvatarUrl = buildFallbackAvatar(username || userId || fullName);
  const avatarUrl = avatarError ? fallbackAvatarUrl : (avatarUrlRaw || fallbackAvatarUrl);

  return (
    <div className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-4">
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

        <Link
          to={userId ? `/users/${userId}` : "/login"}
          className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-white/5 transition"
        >
          <div className="h-10 w-10 rounded-xl bg-white/10 overflow-hidden grid place-items-center">
            <img
              src={avatarUrl}
              alt=""
              className="h-full w-full object-cover"
              onError={() => {
                if (!avatarError) setAvatarError(true);
              }}
              draggable={false}
            />
          </div>

          <div className="hidden sm:block leading-tight">
            <div className="text-sm font-semibold text-white">{fullName}</div>
            <div className="text-xs text-slate-400">{email || "\u00A0"}</div>
          </div>
        </Link>
      </div>
    </div>
  );
}