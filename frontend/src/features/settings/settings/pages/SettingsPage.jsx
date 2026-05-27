import { Bell, LogOut, MonitorCog, Moon, Save, Shield, Sun, UserRoundCog } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../shared/components/Button';
import GlassCard from '../../../shared/components/GlassCard';
import { useAuth } from '../../auth/hooks/useAuth';
import { profileApi } from '../../profile/api/profile.api';
import { settingsApi } from '../api/settings.api';

const THEME_KEY = 'ui.theme.mode';

function cx(...parts) {
  return parts.filter(Boolean).join(' ');
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx(
        'relative inline-flex h-9 w-[68px] items-center rounded-full border transition',
        checked ? 'border-cyan-400/30 bg-cyan-400/15' : 'border-white/10 bg-slate-900/80'
      )}
    >
      <span className={cx('absolute left-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-900 shadow transition-transform', checked ? 'translate-x-[30px]' : 'translate-x-0')}>
        {checked ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
      </span>
    </button>
  );
}

function SettingRow({ title, description, right }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <div>
        <div className="text-sm font-semibold text-white">{title}</div>
        <div className="mt-1 text-xs leading-5 text-slate-400">{description}</div>
      </div>
      <div className="shrink-0">{right}</div>
    </div>
  );
}

function pickEmail(user) {
  return user?.email || user?.tdmuEmail || user?.tDMUEmail || user?.schoolEmail || user?.accountEmail || '';
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') return true;
    return (window.localStorage.getItem(THEME_KEY) || 'dark') !== 'light';
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    privacyLevel: 1,
    allowDM: true,
    showEmail: true,
    showPhoneNumber: false,
    showDateOfBirth: false,
    showEducation: true,
    showExperience: true,
    showCertificates: true,
    showProjects: true,
    showContributionHeatmap: true,
    showGitHubStyleProfile: true,
    allowCvDownload: true,
    isCvPublic: true,
    emailNotifications: true,
    pushNotifications: true,
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [prefs, meFull] = await Promise.all([
          settingsApi.get().catch(() => null),
          profileApi.getMeFull().catch(() => null),
        ]);
        if (!alive) return;
        setProfile(meFull || null);
        const data = prefs || {};
        const notifyPrefs = typeof data.notifyPrefsJson === 'string' ? JSON.parse(data.notifyPrefsJson || '{}') : (data.notifyPrefsJson || {});
        setForm((prev) => ({
          ...prev,
          privacyLevel: Number(data.privacyLevel ?? prev.privacyLevel),
          allowDM: data.allowDM !== false,
          showEmail: data.showEmail !== false,
          showPhoneNumber: !!data.showPhoneNumber,
          showDateOfBirth: !!data.showDateOfBirth,
          showEducation: data.showEducation !== false,
          showExperience: data.showExperience !== false,
          showCertificates: data.showCertificates !== false,
          showProjects: data.showProjects !== false,
          showContributionHeatmap: data.showContributionHeatmap !== false,
          showGitHubStyleProfile: data.showGitHubStyleProfile !== false,
          allowCvDownload: data.allowCvDownload !== false,
          isCvPublic: data.isCvPublic !== false,
          emailNotifications: notifyPrefs.email !== false,
          pushNotifications: notifyPrefs.push !== false,
        }));
      } catch (error) {
        console.error('Load settings error', error);
      }
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const body = document.body;
    const mode = darkMode ? 'dark' : 'light';
    root.classList.toggle('dark', darkMode);
    root.setAttribute('data-theme', mode);
    body?.setAttribute('data-theme', mode);
    try { window.localStorage.setItem(THEME_KEY, mode); } catch {}
  }, [darkMode]);

  const effectiveUser = useMemo(() => ({ ...(user || {}), ...(profile || {}) }), [user, profile]);
  const accountName = useMemo(() => effectiveUser?.fullName || effectiveUser?.displayName || effectiveUser?.username || pickEmail(effectiveUser) || 'Tài khoản của bạn', [effectiveUser]);
  const accountEmail = useMemo(() => pickEmail(effectiveUser), [effectiveUser]);

  async function handleSave() {
    setSaving(true);
    setMessage('');
    try {
      await settingsApi.update({
        privacyLevel: Number(form.privacyLevel),
        allowDM: !!form.allowDM,
        showEmail: !!form.showEmail,
        showPhoneNumber: !!form.showPhoneNumber,
        showDateOfBirth: !!form.showDateOfBirth,
        showEducation: !!form.showEducation,
        showExperience: !!form.showExperience,
        showCertificates: !!form.showCertificates,
        showProjects: !!form.showProjects,
        showContributionHeatmap: !!form.showContributionHeatmap,
        showGitHubStyleProfile: !!form.showGitHubStyleProfile,
        allowCvDownload: !!form.allowCvDownload,
        isCvPublic: !!form.isCvPublic,
        notifyPrefsJson: JSON.stringify({ email: !!form.emailNotifications, push: !!form.pushNotifications, theme: darkMode ? 'dark' : 'light' }),
      });
      setMessage('Đã lưu cài đặt thành công.');
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Không thể lưu cài đặt.');
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    logout();
    navigate('/auth/login', { replace: true });
  }

  return (
    <div className="grid gap-4 lg:gap-5">
      <GlassCard className="overflow-hidden p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-200">Settings</div>
            <h1 className="mt-3 text-xl font-black text-white sm:text-2xl">Cài đặt hệ thống</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Thu gọn bố cục và font chữ để sử dụng dễ nhìn hơn trên màn hình nhỏ, đồng thời giữ đầy đủ cài đặt hồ sơ và quyền riêng tư.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-xs text-slate-300">
            <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Tài khoản</div>
            <div className="mt-1 text-sm font-semibold text-white">{accountName}</div>
            <div className="mt-1 text-xs text-slate-400">{accountEmail || 'Chưa có email'}</div>
          </div>
        </div>
        {message ? <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">{message}</div> : null}
      </GlassCard>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]">
        <div className="space-y-4">
          <GlassCard className="p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-2xl border border-white/10 bg-slate-900/70 text-cyan-200"><MonitorCog className="h-4 w-4" /></div><div><div className="text-sm font-bold text-white">Giao diện</div><div className="text-xs text-slate-400">Tối ưu chế độ hiển thị và font chữ.</div></div></div>
            <div className="space-y-3">
              <SettingRow title="Dark mode" description="Bật chế độ tối để đồng bộ giao diện cyber/dark của hệ thống." right={<Toggle checked={darkMode} onChange={setDarkMode} label="Dark mode" />} />
              <div className="grid gap-3 sm:grid-cols-2">
                <button type="button" onClick={() => setDarkMode(false)} className={cx('rounded-2xl border p-4 text-left transition', !darkMode ? 'border-cyan-400/30 bg-cyan-400/10' : 'border-white/10 bg-slate-950/35 hover:border-white/15')}><div className="flex items-center gap-2 text-sm text-white"><Sun className="h-4 w-4 text-amber-300" /> Chế độ sáng</div><div className="mt-2 text-xs leading-5 text-slate-400">Phù hợp khi làm việc ban ngày.</div></button>
                <button type="button" onClick={() => setDarkMode(true)} className={cx('rounded-2xl border p-4 text-left transition', darkMode ? 'border-cyan-400/30 bg-cyan-400/10' : 'border-white/10 bg-slate-950/35 hover:border-white/15')}><div className="flex items-center gap-2 text-sm text-white"><Moon className="h-4 w-4 text-cyan-300" /> Chế độ tối</div><div className="mt-2 text-xs leading-5 text-slate-400">Tối ưu cho thời gian sử dụng dài.</div></button>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-2xl border border-white/10 bg-slate-900/70 text-cyan-200"><Bell className="h-4 w-4" /></div><div><div className="text-sm font-bold text-white">Thông báo</div><div className="text-xs text-slate-400">Email, thông báo trong app và tương tác xã hội.</div></div></div>
            <div className="space-y-3">
              <SettingRow title="Thông báo qua email" description="Nhận email khi có bài viết, phản hồi hoặc cập nhật quan trọng." right={<Toggle checked={form.emailNotifications} onChange={(v) => setForm({ ...form, emailNotifications: v })} label="Email" />} />
              <SettingRow title="Thông báo trong ứng dụng" description="Hiển thị ngay trên thanh thông báo khi có tương tác mới." right={<Toggle checked={form.pushNotifications} onChange={(v) => setForm({ ...form, pushNotifications: v })} label="Push" />} />
              <SettingRow title="Cho phép nhắn tin riêng" description="Người dùng khác có thể mở cuộc trò chuyện trực tiếp với bạn." right={<Toggle checked={form.allowDM} onChange={(v) => setForm({ ...form, allowDM: v })} label="DM" />} />
            </div>
          </GlassCard>
        </div>

        <div className="space-y-4">
          <GlassCard className="p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-2xl border border-white/10 bg-slate-900/70 text-cyan-200"><Shield className="h-4 w-4" /></div><div><div className="text-sm font-bold text-white">Quyền riêng tư</div><div className="text-xs text-slate-400">Kiểm soát hiển thị thông tin hồ sơ.</div></div></div>
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Phạm vi hiển thị hồ sơ</label>
              <div className="grid gap-2">
                {[[1, 'Công khai'], [2, 'Trong trường'], [3, 'Bạn bè'], [4, 'Riêng tư']].map(([value, label]) => {
                  const active = Number(form.privacyLevel) === Number(value);
                  return <button key={value} type="button" onClick={() => setForm({ ...form, privacyLevel: Number(value) })} className={cx('rounded-2xl border px-4 py-3 text-left text-sm transition', active ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-100' : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/15')}>{label}</button>;
                })}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <SettingRow title="Hiện email" description="Cho phép hiển thị email trên trang cá nhân." right={<Toggle checked={form.showEmail} onChange={(v) => setForm({ ...form, showEmail: v })} label="Show email" />} />
                <SettingRow title="Hiện số điện thoại" description="Cho phép hiển thị số điện thoại cho người xem." right={<Toggle checked={form.showPhoneNumber} onChange={(v) => setForm({ ...form, showPhoneNumber: v })} label="Show phone" />} />
                <SettingRow title="Hiện ngày sinh" description="Có hiển thị ngày sinh trên profile hay không." right={<Toggle checked={form.showDateOfBirth} onChange={(v) => setForm({ ...form, showDateOfBirth: v })} label="Show birthday" />} />
                <SettingRow title="CV public" description="Cho phép người khác xem CV công khai của bạn." right={<Toggle checked={form.isCvPublic} onChange={(v) => setForm({ ...form, isCvPublic: v })} label="CV public" />} />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-2xl border border-white/10 bg-slate-900/70 text-cyan-200"><UserRoundCog className="h-4 w-4" /></div><div><div className="text-sm font-bold text-white">Hiển thị trang cá nhân</div><div className="text-xs text-slate-400">Bật/tắt các section của hồ sơ GitHub-style.</div></div></div>
            <div className="space-y-3">
              {[['showEducation','Học vấn'],['showExperience','Kinh nghiệm'],['showCertificates','Chứng chỉ'],['showProjects','Dự án'],['showContributionHeatmap','Contribution heatmap'],['showGitHubStyleProfile','Bố cục GitHub-style'],['allowCvDownload','Cho phép tải CV']].map(([key,label]) => (
                <SettingRow key={key} title={label} description={`Bật hoặc tắt phần ${label.toLowerCase()} trên trang cá nhân.`} right={<Toggle checked={!!form[key]} onChange={(v) => setForm({ ...form, [key]: v })} label={label} />} />
              ))}
            </div>
          </GlassCard>

          <div className="flex flex-wrap justify-end gap-3">
            <button type="button" onClick={handleLogout} className="inline-flex items-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-2.5 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/15"><LogOut className="h-4 w-4" /> Đăng xuất</button>
            <Button onClick={handleSave} disabled={saving}><Save className="h-4 w-4" /> {saving ? 'Đang lưu...' : 'Lưu cài đặt'}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
