import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ExternalLink, FileUser, Github, GraduationCap, Link2, MapPin, Pencil, Phone, Sparkles, Star, Users, Award, CalendarDays } from "lucide-react";
import GlassCard from "../../../shared/components/GlassCard";
import Button from "../../../shared/components/Button";
import { profileApi } from "../api/profile.api";
import { buildAvatarCandidates } from "../../../shared/utils/avatar";
import { PROFILE_LAYOUT_KEY, UI_PREFERENCES_EVENT, readUiPreference } from "../../../shared/utils/uiPreferences";

function Section({ title, subtitle, right, children }) {
  return (
    <GlassCard className="p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-base font-bold text-[var(--text-primary)] sm:text-lg">{title}</div>
          {subtitle ? <div className="mt-1 text-xs text-[var(--text-muted)] sm:text-sm">{subtitle}</div> : null}
        </div>
        {right}
      </div>
      {children}
    </GlassCard>
  );
}

function HeatCell({ level }) {
  const palette = ["bg-slate-900/80", "bg-emerald-900/60", "bg-emerald-700/70", "bg-emerald-500/80", "bg-emerald-300"];
  return <div className={`h-3.5 w-3.5 rounded-[4px] border border-white/5 ${palette[Math.max(0, Math.min(level, 4))]}`} />;
}

function buildHeatmap(contributions) {
  const today = new Date();
  const days = [];
  for (let i = 139; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d);
  }
  const byDate = new Map();
  (contributions || []).forEach((c) => {
    const key = String(c.contributionDate || "").slice(0, 10);
    byDate.set(key, (byDate.get(key) || 0) + Number(c.contributionCount || 0));
  });
  return days.map((d) => {
    const key = d.toISOString().slice(0, 10);
    const value = byDate.get(key) || 0;
    const level = value === 0 ? 0 : value < 2 ? 1 : value < 4 ? 2 : value < 7 ? 3 : 4;
    return { key, value, level, label: d.toLocaleDateString("vi-VN") };
  });
}

function compactDate(value) {
  if (!value) return "";
  try { return new Date(value).toLocaleDateString("vi-VN"); } catch { return value; }
}

function splitStack(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value).split(",").map((x) => x.trim()).filter(Boolean);
}

function getProfileLayoutPreference() {
  return readUiPreference(PROFILE_LAYOUT_KEY, "horizontal");
}

export default function ProfilePage() {
  const { userId, username } = useParams();
  const meId = localStorage.getItem("userId");
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [profileLayout, setProfileLayout] = useState(getProfileLayoutPreference);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const targetId = userId || null;
        let resolvedProfile = null;

        try {
          resolvedProfile = targetId ? await profileApi.getFull(targetId) : await profileApi.getFullByUsername(username);
        } catch {
          resolvedProfile = targetId ? await profileApi.getById(targetId).catch(() => null) : null;
        }

        if (!alive) return;
        setProfile(resolvedProfile);

        const feedUserId = resolvedProfile?.userId || targetId;
        if (feedUserId) {
          const feed = await profileApi.getPostsByUser(feedUserId, { page: 1, pageSize: 8 }).catch(() => ({ items: [] }));
          if (!alive) return;
          setPosts(Array.isArray(feed?.items) ? feed.items : []);
        } else {
          setPosts([]);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [userId, username]);

  useEffect(() => { setAvatarIndex(0); }, [profile?.avatarUrl, profile?.username, profile?.fullName]);

  useEffect(() => {
    function syncLayout() {
      setProfileLayout(getProfileLayoutPreference());
    }

    window.addEventListener("storage", syncLayout);
    window.addEventListener(UI_PREFERENCES_EVENT, syncLayout);
    return () => {
      window.removeEventListener("storage", syncLayout);
      window.removeEventListener(UI_PREFERENCES_EVENT, syncLayout);
    };
  }, []);

  const isMe = useMemo(() => meId && profile?.userId && String(meId) === String(profile.userId), [meId, profile?.userId]);
  const avatarCandidates = useMemo(() => buildAvatarCandidates(profile || {}), [profile]);
  const avatarUrl = avatarCandidates[Math.min(avatarIndex, Math.max(avatarCandidates.length - 1, 0))] || "";
  const heatmap = useMemo(() => buildHeatmap(profile?.contributions), [profile?.contributions]);
  const pinnedProjects = useMemo(() => (profile?.projects || []).filter((p) => p.isPinned || p.isFeatured).slice(0, 6), [profile?.projects]);
  const horizontalLayout = profileLayout !== "stacked";

  if (loading) return <GlassCard className="p-6 text-sm text-[var(--text-secondary)]">Đang tải hồ sơ...</GlassCard>;
  if (!profile) return <GlassCard className="p-6 text-sm text-[var(--text-secondary)]">Không tìm thấy hồ sơ.</GlassCard>;

  const openToText = [profile.openToInternship ? "Internship" : null, profile.openToCollab ? "Collab" : null].filter(Boolean).join(" • ");

  return (
    <div className={cx("grid gap-4", horizontalLayout ? "grid-cols-1" : "xl:grid-cols-[320px_minmax(0,1fr)]")}>
      <div className={cx(horizontalLayout ? "grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)]" : "space-y-4")}>
        <GlassCard className="overflow-hidden p-0">
          <div className="h-24 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.25),transparent_35%),radial-gradient(circle_at_top_right,rgba(99,102,241,0.22),transparent_40%),linear-gradient(135deg,#0f172a,#111827,#1e293b)] sm:h-28" />
          <div className={cx("px-4 pb-5 sm:px-5", horizontalLayout && "lg:grid lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-start lg:gap-6")}>
            <div className="-mt-14 h-28 w-28 overflow-hidden rounded-full border-4 border-slate-950 bg-slate-900 shadow-2xl sm:h-32 sm:w-32">
              <img src={avatarUrl} alt={profile.fullName} className="h-full w-full object-cover" onError={() => setAvatarIndex((prev) => (prev < avatarCandidates.length - 1 ? prev + 1 : prev))} />
            </div>
            <div className={cx(horizontalLayout && "mt-4 lg:mt-5")}>
              <div className="text-2xl font-black text-[var(--text-primary)]">{profile.fullName}</div>
              <div className="mt-1 text-sm text-[var(--text-muted)]">@{profile.username}</div>
              {profile.headline ? <div className="mt-3 text-sm font-medium text-[var(--text-primary)]">{profile.headline}</div> : null}
              {profile.bio ? <div className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{profile.bio}</div> : null}
              <div className={cx("mt-4 text-sm text-[var(--text-secondary)]", horizontalLayout ? "grid gap-2 sm:grid-cols-2" : "space-y-2")}>
                {profile.location ? <div className="flex items-center gap-2"><MapPin className="ui-icon text-slate-500" /> {profile.location}</div> : null}
                {profile.major || profile.className ? <div className="flex items-center gap-2"><GraduationCap className="ui-icon text-slate-500" /> {[profile.major, profile.className].filter(Boolean).join(" • ")}</div> : null}
                {profile.phoneNumber ? <div className="flex items-center gap-2"><Phone className="ui-icon text-slate-500" /> {profile.phoneNumber}</div> : null}
              </div>
            </div>
            <div className={cx("mt-4", horizontalLayout && "lg:mt-5 lg:min-w-[220px]")}>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-2xl border border-[color:var(--border-soft)] bg-[var(--surface-muted)] px-2 py-3"><div className="font-black text-[var(--text-primary)]">{profile.followersCount || 0}</div><div className="mt-1 text-[var(--text-muted)]">Followers</div></div>
                <div className="rounded-2xl border border-[color:var(--border-soft)] bg-[var(--surface-muted)] px-2 py-3"><div className="font-black text-[var(--text-primary)]">{profile.publicRepoCount || 0}</div><div className="mt-1 text-[var(--text-muted)]">Projects</div></div>
                <div className="rounded-2xl border border-[color:var(--border-soft)] bg-[var(--surface-muted)] px-2 py-3"><div className="font-black text-[var(--text-primary)]">{profile.contributionScore || 0}</div><div className="mt-1 text-[var(--text-muted)]">Điểm</div></div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.githubUrl ? <a href={profile.githubUrl} target="_blank" rel="noreferrer"><Button variant="ghost"><Github className="ui-icon" /> GitHub</Button></a> : null}
                {profile.portfolioUrl || profile.websiteUrl ? <a href={profile.portfolioUrl || profile.websiteUrl} target="_blank" rel="noreferrer"><Button variant="ghost"><ExternalLink className="ui-icon" /> Portfolio</Button></a> : null}
                {profile.cvs?.[0]?.fileUrl ? <a href={profile.cvs[0].fileUrl} target="_blank" rel="noreferrer"><Button variant="ghost"><FileUser className="ui-icon" /> CV</Button></a> : null}
                {isMe ? <Link to="/me/edit"><Button><Pencil className="ui-icon" /> Chỉnh sửa trang cá nhân </Button></Link> : null}
              </div>
            </div>
          </div>
        </GlassCard>

        <Section title="Open to" subtitle="Định hướng nghề nghiệp hiện tại">
          <div className="text-sm text-[var(--text-secondary)]">{openToText || "Chưa cập nhật"}</div>
          {profile.preferredLocation ? <div className="mt-2 text-xs text-[var(--text-muted)]">{profile.preferredLocation}</div> : null}
        </Section>

        <Section title="Kỹ năng nổi bật">
          <div className="flex flex-wrap gap-2">
            {(profile.skills || []).slice(0, 16).map((s) => (
              <span key={s.skillId} className="rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-100">
                {s.skillName}
              </span>
            ))}
            {!(profile.skills || []).length ? <div className="text-sm text-slate-500">Chưa có kỹ năng.</div> : null}
          </div>
        </Section>

        <Section title="Liên kết cá nhân">
          <div className="space-y-2 text-sm">
            {profile.links?.filter((x) => x.isVisible).map((link) => (
              <a key={link.linkId} href={link.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-2xl border border-[color:var(--border-soft)] bg-[var(--surface-muted)] px-3 py-2.5 text-[var(--text-secondary)] transition hover:border-[color:var(--border-strong)]">
                <span className="truncate">{link.title || link.type}</span>
                <Link2 className="ui-icon shrink-0 text-slate-500" />
              </a>
            ))}
            {!profile.links?.length ? <div className="text-sm text-slate-500">Chưa có liên kết.</div> : null}
          </div>
        </Section>
      </div>

      <div className="space-y-4">
        <GlassCard className="p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Profile</div>
              <h1 className="mt-2 text-2xl font-black text-[var(--text-primary)] sm:text-3xl">Trang cá nhân học tập & portfolio</h1>
              <div className="mt-2 text-sm text-[var(--text-secondary)]">Bố cục thiên về học tập, dự án cá nhân, CV và hoạt động đóng góp giống phong cách GitHub.</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center text-xs sm:grid-cols-4">
              <div className="rounded-2xl border border-[color:var(--border-soft)] bg-[var(--surface-muted)] px-3 py-3"><div className="font-black text-[var(--text-primary)]">{profile.profileCompletion || 0}%</div><div className="mt-1 text-[var(--text-muted)]">Hoàn thiện</div></div>
              <div className="rounded-2xl border border-[color:var(--border-soft)] bg-[var(--surface-muted)] px-3 py-3"><div className="font-black text-[var(--text-primary)]">{profile.pinnedProjectCount || 0}</div><div className="mt-1 text-[var(--text-muted)]">Pinned</div></div>
              <div className="rounded-2xl border border-[color:var(--border-soft)] bg-[var(--surface-muted)] px-3 py-3"><div className="font-black text-[var(--text-primary)]">{profile.followingCount || 0}</div><div className="mt-1 text-[var(--text-muted)]">Following</div></div>
              <div className="rounded-2xl border border-[color:var(--border-soft)] bg-[var(--surface-muted)] px-3 py-3"><div className="font-black text-[var(--text-primary)]">{profile.currentYear || "-"}</div><div className="mt-1 text-[var(--text-muted)]">Năm học</div></div>
            </div>
          </div>
        </GlassCard>

        <div className="flex flex-wrap gap-2">
          {[
            ["overview", "Tổng quan"],
            ["projects", "Dự án"],
            ["cv", "CV"],
            ["activity", "Hoạt động"],
          ].map(([key, label]) => (
            <button key={key} type="button" onClick={() => setTab(key)} className={cx("rounded-full border px-4 py-2 text-sm font-semibold transition", tab === key ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-200" : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/15")}>
              {label}
            </button>
          ))}
        </div>

        <Section title="Contribution heatmap" subtitle="Tổng hợp hoạt động học tập, dự án và đóng góp trong 20 tuần gần nhất" right={<div className="text-xs text-slate-500">{profile.contributions?.length || 0} hoạt động</div>}>
          <div className="overflow-x-auto">
            <div className="grid min-w-[720px] grid-cols-[repeat(20,minmax(0,1fr))] gap-1.5">
              {Array.from({ length: 20 }).map((_, weekIndex) => (
                <div key={weekIndex} className="space-y-1.5">
                  {heatmap.slice(weekIndex * 7, weekIndex * 7 + 7).map((cell) => <HeatCell key={cell.key} level={cell.level} />)}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Less</span>
            <div className="flex items-center gap-1.5"><HeatCell level={0} /><HeatCell level={1} /><HeatCell level={2} /><HeatCell level={3} /><HeatCell level={4} /></div>
            <span>More</span>
          </div>
        </Section>

        {tab === "overview" ? (
          <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <Section title="Pinned projects" subtitle="Các sản phẩm nổi bật để chia sẻ với cộng đồng">
                <div className="grid gap-3 md:grid-cols-2">
                  {(pinnedProjects.length ? pinnedProjects : profile.projects || []).slice(0, 6).map((project) => (
                    <div key={project.projectId} className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-bold text-white">{project.projectName}</div>
                          <div className="mt-1 text-xs text-slate-500">{project.primaryLanguage || "Project"}</div>
                        </div>
                        {project.isPinned || project.isFeatured ? <Star className="h-4 w-4 text-amber-300" /> : null}
                      </div>
                      <div className="mt-3 text-sm leading-6 text-slate-300">{project.summary || project.description || "Chưa có mô tả."}</div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {splitStack(project.techStack).slice(0, 5).map((tech) => <span key={tech} className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-slate-300">{tech}</span>)}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400">
                        <span>{project.commitCount || 0} commits</span>
                        <span>{project.starsCount || 0} stars</span>
                      </div>
                      <div className="mt-4 flex gap-3 text-sm font-semibold">
                        {project.repositoryUrl ? <a href={project.repositoryUrl} target="_blank" rel="noreferrer" className="text-cyan-300">Repo</a> : null}
                        {project.demoUrl ? <a href={project.demoUrl} target="_blank" rel="noreferrer" className="text-cyan-300">Demo</a> : null}
                      </div>
                    </div>
                  ))}
                  {!profile.projects?.length ? <div className="text-sm text-slate-500">Chưa có dự án.</div> : null}
                </div>
              </Section>

              <Section title="Activity timeline" subtitle="Kết hợp dự án, bài viết và đóng góp gần đây">
                <div className="space-y-3">
                  {(profile.contributions || []).slice(0, 8).map((item) => (
                    <div key={item.contributionId} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-white">{item.sourceTitle || item.sourceType}</div>
                          <div className="mt-1 text-xs text-slate-500">{compactDate(item.contributionDate)} • {item.contributionCount} hoạt động</div>
                        </div>
                        <Sparkles className="h-4 w-4 text-cyan-300" />
                      </div>
                    </div>
                  ))}
                  {!(profile.contributions || []).length ? <div className="text-sm text-slate-500">Chưa có hoạt động đóng góp.</div> : null}
                </div>
              </Section>
            </div>

            <div className="space-y-4">
              <Section title="Kinh nghiệm">
                <div className="space-y-3">
                  {(profile.experiences || []).slice(0, 5).map((item) => (
                    <div key={item.experienceId} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex items-center gap-2 text-white"><Sparkles className="h-4 w-4 text-cyan-300" /><span className="font-semibold">{item.positionTitle}</span></div>
                      <div className="mt-1 text-sm text-slate-300">{item.companyName}</div>
                      <div className="mt-1 text-xs text-slate-500">{compactDate(item.startDate)} - {item.isCurrent ? "Hiện tại" : compactDate(item.endDate) || "-"}</div>
                      {item.description ? <div className="mt-2 text-sm text-slate-300">{item.description}</div> : null}
                    </div>
                  ))}
                  {!(profile.experiences || []).length ? <div className="text-sm text-slate-500">Chưa có kinh nghiệm.</div> : null}
                </div>
              </Section>

              <Section title="Học vấn">
                <div className="space-y-3">
                  {(profile.educations || []).slice(0, 4).map((item) => (
                    <div key={item.educationId} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex items-center gap-2 text-white"><GraduationCap className="h-4 w-4 text-cyan-300" /><span className="font-semibold">{item.schoolName}</span></div>
                      <div className="mt-1 text-sm text-slate-300">{[item.degree, item.major].filter(Boolean).join(" • ")}</div>
                      <div className="mt-1 text-xs text-slate-500">{compactDate(item.startDate)} - {item.isCurrent ? "Hiện tại" : compactDate(item.endDate) || "-"}</div>
                    </div>
                  ))}
                  {!(profile.educations || []).length ? <div className="text-sm text-slate-500">Chưa có học vấn mở rộng.</div> : null}
                </div>
              </Section>

              <Section title="Chứng chỉ & highlights">
                <div className="space-y-3">
                  {(profile.certificates || []).slice(0, 3).map((item) => (
                    <div key={item.certificateId} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex items-center gap-2 text-white"><Award className="h-4 w-4 text-amber-300" /><span className="font-semibold">{item.certificateName}</span></div>
                      <div className="mt-1 text-xs text-slate-500">{item.issuer || "Chưa rõ đơn vị"}</div>
                    </div>
                  ))}
                  {(profile.highlights || []).slice(0, 3).map((item) => (
                    <div key={item.highlightId} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="font-semibold text-white">{item.title}</div>
                      {item.description ? <div className="mt-1 text-sm text-slate-300">{item.description}</div> : null}
                    </div>
                  ))}
                  {!(profile.certificates || []).length && !(profile.highlights || []).length ? <div className="text-sm text-slate-500">Chưa có dữ liệu nổi bật.</div> : null}
                </div>
              </Section>
            </div>
          </div>
        ) : null}

        {tab === "projects" ? (
          <Section title="Tất cả dự án" subtitle="Kho sản phẩm học tập và cá nhân">
            <div className="grid gap-3 md:grid-cols-2">
              {(profile.projects || []).map((project) => (
                <div key={project.projectId} className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold text-white">{project.projectName}</div>
                      <div className="mt-1 text-xs text-slate-500">{project.primaryLanguage || "Project"}</div>
                    </div>
                    <div className="text-xs text-slate-500">{project.visibility === 1 ? "Public" : "Private"}</div>
                  </div>
                  <div className="mt-3 text-sm leading-6 text-slate-300">{project.summary || project.description || "Chưa có mô tả."}</div>
                  <div className="mt-3 flex flex-wrap gap-2">{splitStack(project.techStack).map((tech) => <span key={tech} className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-slate-300">{tech}</span>)}</div>
                  <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500"><span>{project.commitCount || 0} commits</span><span>{compactDate(project.lastContributionAt)}</span></div>
                </div>
              ))}
              {!(profile.projects || []).length ? <div className="text-sm text-slate-500">Chưa có dự án.</div> : null}
            </div>
          </Section>
        ) : null}

        {tab === "cv" ? (
          <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
            <Section title="CV đính kèm" subtitle="File CV public hoặc riêng tư gắn trực tiếp trên hồ sơ">
              <div className="space-y-3">
                {(profile.cvs || []).map((cv) => (
                  <div key={cv.cvId} className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="text-sm font-bold text-white">{cv.cvTitle}</div>
                        <div className="mt-1 text-xs text-slate-500">{cv.fileName} • v{cv.versionNo}</div>
                      </div>
                      <div className="flex gap-2 text-xs">
                        {cv.isPrimary ? <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-emerald-200">Primary</span> : null}
                        {cv.isPublic ? <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-cyan-200">Public</span> : null}
                      </div>
                    </div>
                    {cv.summary ? <div className="mt-3 text-sm text-slate-300">{cv.summary}</div> : null}
                    <div className="mt-3 flex items-center gap-3 text-sm font-semibold"><a href={cv.fileUrl} target="_blank" rel="noreferrer" className="text-cyan-300">Xem CV</a><span className="text-slate-500">{compactDate(cv.updatedAt)}</span></div>
                  </div>
                ))}
                {!(profile.cvs || []).length ? <div className="text-sm text-slate-500">Chưa có CV.</div> : null}
              </div>
            </Section>
            <Section title="Mục tiêu phát triển" subtitle="Tóm tắt định hướng cá nhân">
              <div className="space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">{profile.careerGoal || "Chưa có mục tiêu phát triển."}</div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><div className="text-xs uppercase tracking-[0.18em] text-slate-500">Preferred location</div><div className="mt-2 text-white">{profile.preferredLocation || "Chưa cập nhật"}</div></div>
              </div>
            </Section>
          </div>
        ) : null}

        {tab === "activity" ? (
          <Section title="Bài viết gần đây" subtitle="Hoạt động chia sẻ kiến thức và sản phẩm">
            <div className="space-y-3">
              {posts.map((post) => (
                <div key={post.postId || post._id || post.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500"><CalendarDays className="h-3.5 w-3.5" /> {compactDate(post.createdAt)}</div>
                  <div className="mt-2 text-sm font-semibold text-white">{post.title || "Bài viết"}</div>
                  <div className="mt-2 text-sm leading-6 text-slate-300">{post.content || post.text || "—"}</div>
                </div>
              ))}
              {!posts.length ? <div className="text-sm text-slate-500">Chưa có hoạt động đăng bài.</div> : null}
            </div>
          </Section>
        ) : null}
      </div>
    </div>
  );
}

function cx(...parts) {
  return parts.flat().filter(Boolean).join(" ");
}
