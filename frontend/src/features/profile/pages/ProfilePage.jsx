import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import GlassCard from "../../../shared/components/GlassCard";
import Button from "../../../shared/components/Button";
import ProfileTabs from "../components/ProfileTabs";
import { profileApi } from "../api/profile.api";
import { Github, Link as LinkIcon, Pencil } from "lucide-react";

function safeUrl(url) {
  if (!url) return "";
  const s = String(url).trim();
  if (!s) return "";
  if (s.includes("cdn.local") || s.includes("localhost")) return "";
  return s.startsWith("http://") || s.startsWith("https://") ? s : `https://${s}`;
}

function seedFromUser(u) {
  return u?.username || u?.userId || u?.id || u?.tdmuEmail || u?.fullName || "me";
}

function buildAvatarFallbacks(seed) {
  const s = seed || "me";
  return [
    `https://api.dicebear.com/7.x/identicon/png?seed=${encodeURIComponent(s)}&size=256`,
    `https://robohash.org/${encodeURIComponent(s)}.png?size=256x256&set=set4`,
    `https://i.pravatar.cc/256?u=${encodeURIComponent(s)}`,
  ];
}

function Avatar({ user, className = "" }) {
  const name = user?.fullName || user?.displayName || user?.username || "U";
  const seed = useMemo(() => seedFromUser(user), [user]);
  const fallbacks = useMemo(() => buildAvatarFallbacks(seed), [seed]);

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

  const src = candidates[idx];

  return (
    <div
      className={
        "overflow-hidden grid place-items-center text-white " +
        className
      }
    >
      {src ? (
        <img
          src={src}
          alt="avatar"
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          onError={() => setIdx((i) => (i + 1 < candidates.length ? i + 1 : i))}
          draggable={false}
        />
      ) : (
        <span className="text-3xl font-black">{String(name).slice(0, 1).toUpperCase()}</span>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("posts");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsErr, setPostsErr] = useState("");

  const meId = localStorage.getItem("userId");
  const isMe = meId && user?.userId && String(meId) === String(user.userId);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setErr("");
      try {
        const u = await profileApi.getById(userId);
        if (!alive) return;
        setUser(u);
      } catch (e) {
        if (!alive) return;
        setUser(null);
        setErr("Không tải được hồ sơ hoặc user không tồn tại.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [userId]);

  useEffect(() => {
    if (!user?.userId) return;
    if (tab !== "posts") return;

    let alive = true;

    (async () => {
      setPostsLoading(true);
      setPostsErr("");
      try {
        if (!profileApi.getPostsByUser) {
          throw new Error("MISSING_API_getPostsByUser");
        }

        const data = await profileApi.getPostsByUser(user.userId, { page: 1, pageSize: 10 });
        const list = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
        if (!alive) return;
        setPosts(list);
      } catch (e) {
        if (!alive) return;
        setPosts([]);
        setPostsErr("Chưa lấy được bài viết (backend chưa có endpoint posts theo userId hoặc lỗi gateway).");
      } finally {
        if (alive) setPostsLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [tab, user?.userId]);

  const githubUrl = safeUrl(user?.github || user?.githubUrl);
  const websiteUrl = safeUrl(user?.website || user?.websiteUrl);

  if (loading) return <GlassCard className="p-6">Đang tải...</GlassCard>;
  if (!user) return <GlassCard className="p-6">{err || "Không tìm thấy user."}</GlassCard>;

  return (
    <div className="grid gap-4">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
        <div className="relative h-28 md:h-36">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-700/55 via-cyan-500/35 to-purple-700/55" />
          <div className="absolute inset-0 opacity-[0.22] [background-image:linear-gradient(to_right,rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.10)_1px,transparent_1px)] [background-size:18px_18px]" />
          <div className="absolute -top-20 -left-16 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-purple-400/20 blur-3xl" />
        </div>

        <div className="px-5 pb-5 md:px-6">
          <div className="-mt-10 md:-mt-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="flex items-end gap-4">
              <Avatar
                user={user}
                className="h-20 w-20 md:h-24 md:w-24 rounded-3xl border border-white/15 bg-slate-950/40 backdrop-blur shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_0_22px_rgba(99,102,241,0.18)]"
              />

              <div className="pb-1">
                <div className="text-2xl md:text-3xl font-black tracking-tight text-white">
                  {user?.fullName || user?.displayName || user?.username}
                </div>
                <div className="text-sm text-slate-300">@{user?.username || "unknown"}</div>
                <div className="mt-2 text-xs text-slate-300">
                  {user?.major || "—"} • {user?.className || "—"}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 md:pb-1">
              {githubUrl ? (
                <a href={githubUrl} target="_blank" rel="noreferrer">
                  <Button variant="ghost" className="gap-2">
                    <Github className="h-4 w-4 stroke-[2.4]" /> GitHub
                  </Button>
                </a>
              ) : null}

              {websiteUrl ? (
                <a href={websiteUrl} target="_blank" rel="noreferrer">
                  <Button variant="ghost" className="gap-2">
                    <LinkIcon className="h-4 w-4 stroke-[2.4]" /> Website
                  </Button>
                </a>
              ) : null}

              {isMe ? (
                <Link to="/me/edit">
                  <Button className="gap-2">
                    <Pencil className="h-4 w-4 stroke-[2.6]" /> Sửa hồ sơ
                  </Button>
                </Link>
              ) : null}
            </div>
          </div>

          <div className="mt-4 text-sm text-slate-200/90">
            {user?.bio ? user.bio : <span className="text-slate-400">Chưa có bio.</span>}
          </div>
        </div>
      </div>

      <ProfileTabs
        tab={tab}
        onChange={setTab}
        counts={{
          posts: user?.postsCount ?? posts.length,
          saved: user?.savedCount,
        }}
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <GlassCard className="p-5 lg:col-span-2">
          {tab === "posts" && (
            <>
              <div className="flex items-center justify-between gap-3">
                <div className="font-extrabold text-white">Bài viết</div>
                <div className="text-xs text-slate-400">
                  {postsLoading ? "Đang tải..." : `${posts.length} bài`}
                </div>
              </div>

              {postsErr ? (
                <div className="mt-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                  {postsErr}
                </div>
              ) : null}

              <div className="mt-4 grid gap-3">
                {postsLoading ? (
                  <div className="text-sm text-slate-400">Đang tải bài viết...</div>
                ) : posts.length === 0 ? (
                  <div className="text-sm text-slate-500">Chưa có bài viết.</div>
                ) : (
                  posts.map((p) => (
                    <div
                      key={p?.postId || p?.id || JSON.stringify(p)}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:bg-white/[0.05] transition"
                    >
                      <div className="text-sm font-extrabold text-white">
                        {p?.title || "Bài viết"}
                      </div>
                      <div className="mt-2 text-sm text-slate-300 whitespace-pre-wrap">
                        {p?.content || p?.text || "—"}
                      </div>
                      <div className="mt-3 text-xs text-slate-500">
                        {p?.createdAt ? new Date(p.createdAt).toLocaleString() : ""}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {tab === "about" && (
            <>
              <div className="font-extrabold text-white">Giới thiệu</div>

              <div className="mt-4 grid md:grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs text-slate-400 mb-1">Email</div>
                  <div className="text-slate-200">{user?.tdmuEmail || "—"}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs text-slate-400 mb-1">Khoa</div>
                  <div className="text-slate-200">{user?.department || "—"}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs text-slate-400 mb-1">Ngành</div>
                  <div className="text-slate-200">{user?.major || "—"}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs text-slate-400 mb-1">Lớp</div>
                  <div className="text-slate-200">{user?.className || "—"}</div>
                </div>
              </div>
            </>
          )}

          {tab === "saved" && (
            <>
              <div className="font-extrabold text-white">Đã lưu</div>
              <div className="mt-3 text-sm text-slate-400">Chưa nối API saved.</div>
            </>
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <div className="font-extrabold text-white">Thông tin</div>

          <div className="mt-4 grid gap-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">UserId</span>
              <span className="text-slate-200 text-right break-all">{user?.userId}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Username</span>
              <span className="text-slate-200">@{user?.username || "—"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">MSSV</span>
              <span className="text-slate-200">{user?.studentCode || "—"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Năm</span>
              <span className="text-slate-200">{user?.enrollmentYear || "—"}</span>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-xs text-slate-400 mb-2">Trạng thái</div>
            <div className="text-sm text-slate-200">
              {user?.status === 1 ? "Đang hoạt động" : "—"}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}