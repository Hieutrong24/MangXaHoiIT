import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, Clock3, Menu, PanelLeftClose, PanelLeftOpen, Search, Users, UserPlus2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Input from "./Input";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { notificationsApi } from "../../features/notifications/api/notifications.api";
import { getNotificationSocket } from "../../features/notifications/services/socket";
import { communityApi } from "../../features/community/api/community.api";
import { profileApi } from "../../features/profile/api/profile.api";
import CreateGroupModal from "../../features/community/components/CreateGroupModal";
import JoinGroupModal from "../../features/community/components/JoinGroupModal";
import { buildAvatarCandidates } from "../utils/avatar";

function cx(...parts) {
  return parts.flat().filter(Boolean).join(" ");
}

const SEARCH_HISTORY_KEY = "ui.header.search.history";
const MAX_HISTORY_ITEMS = 6;

function readSearchHistory() {
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function saveSearchHistory(items) {
  try { localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(items)); } catch {}
}

function pushSearchHistory(value) {
  const q = String(value || "").trim();
  if (!q) return readSearchHistory();
  const current = readSearchHistory().filter((item) => item.toLowerCase() !== q.toLowerCase());
  const next = [q, ...current].slice(0, MAX_HISTORY_ITEMS);
  saveSearchHistory(next);
  return next;
}

export default function Header({ onOpenSidebar, desktopPinned, onTogglePinned }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const userId = useMemo(() => user?.userId || user?.id || localStorage.getItem("userId") || null, [user?.userId, user?.id]);

  const [me, setMe] = useState(null);
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState(() => readSearchHistory());
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [groupMenuOpen, setGroupMenuOpen] = useState(false);
  const [openCreateGroup, setOpenCreateGroup] = useState(false);
  const [openJoinGroup, setOpenJoinGroup] = useState(false);

  const searchWrapRef = useRef(null);
  const desktopInputRef = useRef(null);
  const mobileInputRef = useRef(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!userId) { setMe(null); return; }
      try {
        const data = await profileApi.getMeFull().catch(() => profileApi.getById(userId));
        if (alive) setMe(data);
      } catch {
        if (alive) setMe(null);
      }
    }
    load();
    return () => { alive = false; };
  }, [userId]);

  useEffect(() => { setAvatarIndex(0); }, [me?.avatarUrl, me?.username, me?.fullName, user?.avatarUrl, user?.username]);

  const avatarCandidates = useMemo(() => buildAvatarCandidates({ ...user, ...me }), [me, user]);
  const avatarUrl = avatarCandidates[Math.min(avatarIndex, Math.max(avatarCandidates.length - 1, 0))] || "";

  const fullName = me?.fullName || user?.fullName || user?.displayName || me?.username || user?.username || "Bạn";
  const email = me?.email || me?.tdmuEmail || me?.tDMUEmail || me?.schoolEmail || user?.email || user?.tdmuEmail || user?.tDMUEmail || ''; 

  const loadUnreadCount = useCallback(async () => {
    if (!userId) { setUnreadCount(0); return; }
    try {
      const res = await notificationsApi.unreadCount();
      setUnreadCount(Number(res?.count || 0));
    } catch {
      setUnreadCount(0);
    }
  }, [userId]);

  useEffect(() => {
    loadUnreadCount();
    if (!userId) return;
    const socket = getNotificationSocket();
    if (!socket) return;
    const onNewNotification = () => setUnreadCount((prev) => prev + 1);
    socket.on("notification:new", onNewNotification);
    return () => socket.off("notification:new", onNewNotification);
  }, [loadUnreadCount, userId]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (!searchWrapRef.current?.contains(event.target)) {
        setSearchFocused(false);
        setSearchExpanded(false);
        setMobileSearchOpen(false);
        setGroupMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function submitSearch(rawValue) {
    const q = String(rawValue || "").trim();
    if (!q) return;
    const nextHistory = pushSearchHistory(q);
    setSearchHistory(nextHistory);
    setSearchValue(q);
    setSearchFocused(false);
    setSearchExpanded(false);
    setMobileSearchOpen(false);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  }

  function openDesktopSearch() {
    setSearchExpanded(true); setSearchFocused(true);
    requestAnimationFrame(() => desktopInputRef.current?.focus());
  }

  function openMobileSearch() {
    setMobileSearchOpen(true); setSearchFocused(true);
    requestAnimationFrame(() => mobileInputRef.current?.focus());
  }

  async function handleCreateGroup(payload) {
    const group = await communityApi.createGroup(payload);
    setOpenCreateGroup(false);
    navigate(`/community/groups/${group?._id || group?.id}`);
  }

  async function handleJoinGroup(code) {
    const group = await communityApi.joinByCode(code);
    setOpenJoinGroup(false);
    navigate(`/community/groups/${group?._id || group?.id}`);
  }

  const showSearchDropdown = searchFocused && (searchExpanded || mobileSearchOpen);
  const headerLinks = [
    { to: "/community", label: "Cộng đồng", icon: Users },
  ];

  return (
    <>
      <div ref={searchWrapRef} className="ui-shell-header sticky top-0 z-30 border-b backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <button type="button" onClick={onOpenSidebar} className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-slate-900/80 text-slate-200 transition hover:border-white/15 hover:bg-slate-800/80 lg:hidden" aria-label="Mở sidebar"><Menu className="ui-icon" /></button>
          <button type="button" onClick={onTogglePinned} className="hidden h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-slate-900/80 text-slate-300 transition hover:border-white/15 hover:bg-slate-800/80 hover:text-white lg:grid" aria-label={desktopPinned ? "Thu gọn sidebar" : "Ghim sidebar"}>{desktopPinned ? <PanelLeftClose className="ui-icon" /> : <PanelLeftOpen className="ui-icon" />}</button>

          <div className="min-w-0 flex-1">
            <div className="hidden md:flex md:items-center md:justify-between md:gap-4">
              <div className="flex items-center gap-2">
                {headerLinks.map(({ to, label, icon: Icon }) => (
                  <Link key={to} to={to} className={cx("inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold transition", location.pathname.startsWith(to) ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-200" : "border-white/10 bg-slate-900/80 text-slate-300 hover:border-white/15 hover:bg-slate-800/80 hover:text-white")}>
                    <Icon className="ui-icon" /> {label}
                  </Link>
                ))}
              </div>

              <div className={cx("relative", searchExpanded ? "w-[min(620px,45vw)]" : "w-12")}>
                <div className={cx("flex h-12 items-center overflow-hidden border bg-slate-900/80 shadow-[0_10px_30px_rgba(0,0,0,0.22)] backdrop-blur-xl transition-all duration-300", searchExpanded ? "w-full rounded-t-2xl rounded-b-none border-cyan-400/20" : "w-12 rounded-2xl border-white/10 hover:border-white/15")}>
                  <button type="button" onClick={openDesktopSearch} className={cx("grid h-12 w-12 shrink-0 place-items-center text-slate-400 transition hover:text-white", searchExpanded && "text-cyan-200")} aria-label="Mở tìm kiếm"><Search className="ui-icon" /></button>
                  <div className={cx("min-w-0 flex-1 transition-all duration-300", searchExpanded ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-3 opacity-0")}>
                    <Input ref={desktopInputRef} value={searchValue} onChange={(e) => setSearchValue(e.target.value)} onFocus={() => { setSearchExpanded(true); setSearchFocused(true); }} onKeyDown={(e) => { if (e.key === "Enter") submitSearch(searchValue); if (e.key === "Escape") { setSearchFocused(false); if (!searchValue.trim()) setSearchExpanded(false); desktopInputRef.current?.blur(); } }} placeholder="Tìm bài viết, người dùng..." className="h-12 border-0 bg-transparent px-0 pr-3 text-sm text-white placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0" />
                  </div>
                  {searchExpanded && searchValue ? <button type="button" onClick={() => { setSearchValue(""); desktopInputRef.current?.focus(); }} className="mr-2 grid h-8 w-8 shrink-0 place-items-center rounded-xl text-slate-500 transition hover:bg-white/5 hover:text-white" aria-label="Xóa"><X className="ui-icon" /></button> : null}
                </div>

                <div className={cx("absolute left-0 right-0 top-full hidden overflow-hidden border border-t-0 border-white/10 bg-slate-950/95 shadow-[0_24px_60px_rgba(0,0,0,0.42)] backdrop-blur-2xl transition-all duration-200 md:block", showSearchDropdown && searchExpanded ? "pointer-events-auto translate-y-0 opacity-100 rounded-b-2xl" : "pointer-events-none -translate-y-2 opacity-0")}>
                  <div className="border-b border-white/8 px-4 py-3"><div className="flex items-center justify-between gap-3"><div className="text-sm font-semibold text-white">Tìm kiếm gần đây</div>{searchHistory.length > 0 ? <button type="button" onClick={() => { saveSearchHistory([]); setSearchHistory([]); }} className="text-xs font-medium text-slate-400 transition hover:text-white">Xóa tất cả</button> : null}</div></div>
                  {searchHistory.length > 0 ? <div className="max-h-64 overflow-y-auto p-2">{searchHistory.map((item) => <button key={item} type="button" onClick={() => submitSearch(item)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"><Clock3 className="ui-icon shrink-0 text-slate-500" /><span className="truncate">{item}</span></button>)}</div> : <div className="px-4 py-5 text-sm text-slate-500">Chưa có lịch sử tìm kiếm.</div>}
                </div>
              </div>
            </div>
            <div className="md:hidden"><div className="text-sm font-semibold text-white">Không gian học tập</div><div className="text-xs text-slate-400">Khám phá cộng đồng và luyện code</div></div>
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <button type="button" onClick={openMobileSearch} className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-slate-900/80 text-slate-300 transition hover:border-white/15 hover:bg-slate-800/80 hover:text-white md:hidden" aria-label="Tìm kiếm"><Search className="ui-icon" /></button>
            <div className="relative">
              <button type="button" onClick={() => setGroupMenuOpen((v) => !v)} className={cx("grid h-11 w-11 place-items-center rounded-2xl border transition-all duration-200", groupMenuOpen ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-200" : "border-white/10 bg-slate-900/80 text-slate-300 hover:border-white/15 hover:bg-slate-800/80 hover:text-white")} aria-label="Nhóm học tập"><UserPlus2 className="ui-icon" /></button>
              {groupMenuOpen ? <div className="absolute right-0 top-[calc(100%+10px)] w-60 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 p-2 shadow-[0_24px_60px_rgba(0,0,0,0.42)] backdrop-blur-2xl"><button type="button" onClick={() => { setOpenJoinGroup(true); setGroupMenuOpen(false); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-200 transition hover:bg-white/5"><Users className="ui-icon text-cyan-300" /> Tham gia bằng mã</button><button type="button" onClick={() => { setOpenCreateGroup(true); setGroupMenuOpen(false); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-200 transition hover:bg-white/5"><UserPlus2 className="ui-icon text-cyan-300" /> Tạo nhóm mới</button></div> : null}
            </div>
            <Link to="/notifications" className={cx("relative grid h-11 w-11 place-items-center rounded-2xl border transition-all duration-200", location.pathname === "/notifications" ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-200" : "border-white/10 bg-slate-900/80 text-slate-300 hover:border-white/15 hover:bg-slate-800/80 hover:text-white")} aria-label="Thông báo"><Bell className="ui-icon" />{unreadCount > 0 ? <span className="absolute -right-1 -top-1 grid h-5 min-w-[20px] place-items-center rounded-full border border-slate-950 bg-rose-500 px-1 text-[11px] font-bold text-white shadow-lg">{unreadCount > 99 ? "99+" : unreadCount}</span> : null}</Link>
            <Link to={userId ? `/users/${userId}` : "/auth/login"} className="group flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-2.5 py-2 transition-all duration-200 hover:border-white/15 hover:bg-slate-800/80">
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-800/80 shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
                <img
                  src={avatarUrl}
                  alt={fullName}
                  className="h-full w-full object-cover"
                  draggable={false}
                  onError={(e) => {
                    if (avatarIndex < avatarCandidates.length - 1) {
                      setAvatarIndex((prev) => (prev < avatarCandidates.length - 1 ? prev + 1 : prev));
                      return;
                    }
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = avatarCandidates[0] || '';
                  }}
                />
              </div>
              <div className="hidden min-w-0 sm:block leading-tight">
                <div className="truncate text-sm font-semibold text-white">{fullName}</div>
                <div className="truncate text-xs text-slate-400">{email || " "}</div>
              </div>
            </Link>
          </div>
        </div>

        <div className={cx("overflow-hidden border-t border-white/8 bg-slate-950/90 backdrop-blur-xl transition-all duration-300 md:hidden", mobileSearchOpen ? "max-h-[220px] opacity-100" : "max-h-0 opacity-0")}>
          <div className="px-4 pb-4 pt-3 sm:px-6">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 ui-icon -translate-y-1/2 text-slate-500" />
              <Input ref={mobileInputRef} value={searchValue} onChange={(e) => setSearchValue(e.target.value)} onFocus={() => { setMobileSearchOpen(true); setSearchFocused(true); }} onKeyDown={(e) => { if (e.key === "Enter") submitSearch(searchValue); if (e.key === "Escape") { setSearchFocused(false); if (!searchValue.trim()) setMobileSearchOpen(false); mobileInputRef.current?.blur(); } }} placeholder="Tìm bài viết, người dùng..." className="h-12 rounded-2xl border-white/10 bg-slate-900/80 pl-11 pr-12 text-sm text-white placeholder:text-slate-500" />
              {searchValue ? <button type="button" onClick={() => { setSearchValue(""); mobileInputRef.current?.focus(); }} className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-xl text-slate-500 transition hover:bg-white/5 hover:text-white"><X className="ui-icon" /></button> : null}
            </div>
          </div>
        </div>
      </div>

      <CreateGroupModal open={openCreateGroup} onClose={() => setOpenCreateGroup(false)} onSubmit={handleCreateGroup} />
      <JoinGroupModal open={openJoinGroup} onClose={() => setOpenJoinGroup(false)} onSubmit={handleJoinGroup} />
    </>
  );
}
