import { useEffect, useMemo, useState } from "react";
import Button from "../../../shared/components/Button";
import { Github, Link as LinkIcon, Pencil, UserPlus } from "lucide-react";

function safeUrl(url) {
  if (!url) return "";
  const s = String(url).trim();
  if (!s) return "";
  if (s.includes("cdn.local") || s.includes("localhost")) return "";
  return s.startsWith("http://") || s.startsWith("https://") ? s : `https://${s}`;
}

function pickSeed(user) {
  return (
    user?.username ||
    user?.userId ||
    user?.id ||
    user?.tdmuEmail ||
    user?.fullName ||
    "me"
  );
}

function buildFallbacks(seed) {
  const s = seed || "me";
  return [
    `https://api.dicebear.com/7.x/identicon/png?seed=${encodeURIComponent(s)}&size=256`,
    `https://robohash.org/${encodeURIComponent(s)}.png?size=256x256&set=set4`,
    `https://i.pravatar.cc/256?u=${encodeURIComponent(s)}`,
  ];
}

export default function ProfileHeader({
  user,
  isMe,
  onEdit,
  onFollow,
  isFollowing,
}) {
  const githubUrl = safeUrl(user?.github || user?.githubUrl);
  const websiteUrl = safeUrl(user?.website || user?.websiteUrl);

  const name = user?.fullName || user?.displayName || user?.username || "User";
  const username = user?.username || "";

  const seed = useMemo(() => pickSeed(user), [user]);
  const fallbacks = useMemo(() => buildFallbacks(seed), [seed]);

  const avatarBackend = safeUrl(user?.avatarUrl);
  const candidates = useMemo(() => {
    const list = [];
    if (avatarBackend) list.push(avatarBackend);
    list.push(...fallbacks);
    return list;
  }, [avatarBackend, fallbacks]);

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setIdx(0);
  }, [candidates.join("|")]);

  const avatarSrc = candidates[idx];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
      <div className="relative h-28 md:h-36">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/50 via-cyan-500/35 to-purple-600/50" />
        <div className="absolute inset-0 opacity-[0.22] [background-image:linear-gradient(to_right,rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.10)_1px,transparent_1px)] [background-size:18px_18px]" />
        <div className="absolute -top-20 -left-16 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-purple-400/20 blur-3xl" />
      </div>

      <div className="relative px-5 pb-5 md:px-6">
        <div className="-mt-10 md:-mt-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="flex items-end gap-4">
            <div className="h-20 w-20 md:h-24 md:w-24 rounded-3xl border border-white/15 bg-slate-950/40 backdrop-blur shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_0_22px_rgba(99,102,241,0.18)] overflow-hidden">
              <img
                src={avatarSrc}
                alt="avatar"
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                onError={() => {
                  setIdx((i) => (i + 1 < candidates.length ? i + 1 : i));
                }}
                draggable={false}
              />
            </div>

            <div className="pb-1">
              <div className="text-2xl md:text-3xl font-black tracking-tight text-white">
                {name}
              </div>
              <div className="text-sm text-slate-300">@{username || "unknown"}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 md:pb-1">
            {githubUrl && (
              <a href={githubUrl} target="_blank" rel="noreferrer">
                <Button variant="ghost" className="gap-2">
                  <Github className="h-4 w-4 stroke-[2.4]" />
                  GitHub
                </Button>
              </a>
            )}

            {websiteUrl && (
              <a href={websiteUrl} target="_blank" rel="noreferrer">
                <Button variant="ghost" className="gap-2">
                  <LinkIcon className="h-4 w-4 stroke-[2.4]" />
                  Website
                </Button>
              </a>
            )}

            {isMe ? (
              <Button className="gap-2" onClick={onEdit}>
                <Pencil className="h-4 w-4 stroke-[2.6]" />
                Sửa hồ sơ
              </Button>
            ) : (
              <Button
                className="gap-2 bg-white/10 hover:bg-white/15 border border-white/10"
                onClick={onFollow}
              >
                <UserPlus className="h-4 w-4 stroke-[2.6]" />
                {isFollowing ? "Đang theo dõi" : "Theo dõi"}
              </Button>
            )}
          </div>
        </div>

        <div className="mt-4 text-sm text-slate-200/90 leading-relaxed">
          {user?.bio ? user.bio : <span className="text-slate-400">Chưa có bio.</span>}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
            <div className="text-[11px] text-slate-400">Bài viết</div>
            <div className="text-sm font-extrabold text-white">{user?.postsCount ?? "—"}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
            <div className="text-[11px] text-slate-400">Bạn bè</div>
            <div className="text-sm font-extrabold text-white">{user?.friendsCount ?? "—"}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
            <div className="text-[11px] text-slate-400">Theo dõi</div>
            <div className="text-sm font-extrabold text-white">{user?.followersCount ?? "—"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}