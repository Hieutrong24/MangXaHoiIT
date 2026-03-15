import { useEffect, useMemo, useState } from "react";
import GlassCard from "../../../shared/components/GlassCard";
import Input from "../../../shared/components/Input";
import Button from "../../../shared/components/Button";
import { profileApi } from "../api/profile.api";
import { Save, User, Mail, GraduationCap, Building2, Hash, Link as LinkIcon, Github } from "lucide-react";

function buildFallbackAvatar(seed) {
  const s = seed || "me";
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(s)}`;
}

export default function EditProfilePage() {
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    tdmuEmail: "",
    studentCode: "",
    department: "",
    major: "",
    className: "",
    enrollmentYear: "",
    bio: "",
    githubUrl: "",
    websiteUrl: "",
    avatarUrl: "",
    coverUrl: "",
  });

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setErr("");
      setOk("");

      try {
        const me = await profileApi.getMe();
        if (!mounted) return;

        setForm({
          fullName: me?.fullName || me?.displayName || "",
          username: me?.username || "",
          tdmuEmail: me?.tdmuEmail || "",
          studentCode: me?.studentCode || "",
          department: me?.department || "",
          major: me?.major || "",
          className: me?.className || "",
          enrollmentYear: me?.enrollmentYear ? String(me.enrollmentYear) : "",
          bio: me?.bio || "",
          githubUrl: me?.githubUrl || me?.github || "",
          websiteUrl: me?.websiteUrl || me?.website || "",
          avatarUrl: me?.avatarUrl || "",
          coverUrl: me?.coverUrl || "",
        });
      } catch {
        if (!mounted) return;
        setErr("Không tải được hồ sơ (cần đăng nhập).");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const fallbackAvatar = useMemo(
    () => buildFallbackAvatar(form.username || form.tdmuEmail || form.fullName),
    [form.username, form.tdmuEmail, form.fullName]
  );

  useEffect(() => {
    setAvatarError(false);
  }, [form.avatarUrl, fallbackAvatar]);

  const avatarSrc = avatarError ? fallbackAvatar : (form.avatarUrl || fallbackAvatar);

  const onSubmit = async () => {
    setBusy(true);
    setErr("");
    setOk("");

    try {
      const payload = {
        fullName: form.fullName,
        bio: form.bio,
        githubUrl: form.githubUrl,
        websiteUrl: form.websiteUrl,
        avatarUrl: form.avatarUrl,
        coverUrl: form.coverUrl,
      };

      await profileApi.updateMe(payload);
      setOk("Đã lưu thay đổi!");
    } catch {
      setErr("Lưu thất bại. .");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <GlassCard className="p-6 max-w-4xl">Đang tải...</GlassCard>;

  return (
    <div className="grid gap-4">
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
                  alt=""
                  className="h-full w-full object-cover"
                  onError={() => setAvatarError(true)}
                  draggable={false}
                />
              </div>

              <div className="pb-1">
                <div className="text-2xl md:text-3xl font-black tracking-tight text-white">
                  {form.fullName || "Chỉnh sửa hồ sơ"}
                </div>
                <div className="text-sm text-slate-300">
                  @{form.username || "unknown"} {form.tdmuEmail ? `• ${form.tdmuEmail}` : ""}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 md:pb-1">
              <Button
                onClick={onSubmit}
                disabled={busy}
                className="gap-2 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 hover:brightness-110"
              >
                <Save className="h-4 w-4 stroke-[2.6]" />
                {busy ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </div>

          {err ? (
            <div className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {err}
            </div>
          ) : null}

          {ok ? (
            <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              {ok}
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <GlassCard className="p-5 lg:col-span-2 border border-white/10 bg-white/[0.03]">
          <div className="text-lg font-extrabold tracking-tight text-white">Thông tin công khai</div>
          <div className="mt-4 grid gap-4">
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-slate-300 mb-1 flex items-center gap-2">
                  <User className="h-4 w-4" /> Họ và tên
                </div>
                <Input
                  value={form.fullName}
                  onChange={(e) => setForm((s) => ({ ...s, fullName: e.target.value }))}
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div>
                <div className="text-xs text-slate-300 mb-1 flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email TDMU
                </div>
                <Input value={form.tdmuEmail} disabled />
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-300 mb-1">Bio</div>
              <textarea
                value={form.bio}
                onChange={(e) => setForm((s) => ({ ...s, bio: e.target.value }))}
                className="min-h-[140px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/15"
                placeholder="Giới thiệu ngắn..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-slate-300 mb-1 flex items-center gap-2">
                  <Github className="h-4 w-4" /> GitHub
                </div>
                <Input
                  value={form.githubUrl}
                  onChange={(e) => setForm((s) => ({ ...s, githubUrl: e.target.value }))}
                  placeholder="https://github.com/..."
                />
              </div>
              <div>
                <div className="text-xs text-slate-300 mb-1 flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" /> Website
                </div>
                <Input
                  value={form.websiteUrl}
                  onChange={(e) => setForm((s) => ({ ...s, websiteUrl: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5 border border-white/10 bg-white/[0.03]">
          <div className="text-lg font-extrabold tracking-tight text-white">Thông tin học vụ</div>

          <div className="mt-4 grid gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <Hash className="h-4 w-4" /> Mã SV
              </div>
              <div className="text-sm font-bold text-white mt-1">{form.studentCode || "—"}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <Building2 className="h-4 w-4" /> Khoa
              </div>
              <div className="text-sm font-bold text-white mt-1">{form.department || "—"}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <GraduationCap className="h-4 w-4" /> Ngành
              </div>
              <div className="text-sm font-bold text-white mt-1">{form.major || "—"}</div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <div className="text-xs text-slate-400">Lớp</div>
                <div className="text-sm font-bold text-white mt-1">{form.className || "—"}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <div className="text-xs text-slate-400">Khoá</div>
                <div className="text-sm font-bold text-white mt-1">{form.enrollmentYear || "—"}</div>
              </div>
            </div>

            <div className="pt-2">
              <div className="text-xs text-slate-300 mb-1">Avatar URL (tuỳ chọn)</div>
              <Input
                value={form.avatarUrl}
                onChange={(e) => setForm((s) => ({ ...s, avatarUrl: e.target.value }))}
                placeholder="https://..."
              />
              <div className="mt-2 text-xs text-slate-400">
                Nếu link avatar hỏng, hệ thống sẽ tự dùng avatar tạo theo username.
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-300 mb-1">Cover URL (tuỳ chọn)</div>
              <Input
                value={form.coverUrl}
                onChange={(e) => setForm((s) => ({ ...s, coverUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}