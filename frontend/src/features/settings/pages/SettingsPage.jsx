import { Bell, LayoutPanelTop, LogOut, MonitorCog, Moon, PanelsTopLeft, Save, Shield, Sun, UserRoundCog, Volume2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../shared/components/Button';
import GlassCard from '../../../shared/components/GlassCard';
import {
  ICON_DENSITY_KEY,
  PROFILE_LAYOUT_KEY,
  THEME_KEY,
  applyIconDensityPreference,
  applyProfileLayoutPreference,
  applyThemePreference,
  dispatchUiPreferencesChanged,
  readUiPreference,
  writeUiPreference,
} from '../../../shared/utils/uiPreferences';
import { useAuth } from '../../auth/hooks/useAuth';
import { profileApi } from '../../profile/api/profile.api';
import { settingsApi } from '../api/settings.api';
import {
  readNotificationSoundEnabled,
  writeNotificationSoundEnabled,
} from '../../../shared/realtime/notificationSounds';

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
        'relative inline-flex h-7 w-[52px] items-center rounded-full border transition duration-200',
        checked
          ? 'border-cyan-300/35 bg-cyan-400/15 shadow-[0_0_14px_rgba(34,211,238,0.12)]'
          : 'border-[color:var(--border-soft)] bg-[var(--surface-card)]'
      )}
    >
      <span
        className={cx(
          'absolute left-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm transition-transform duration-200',
          checked ? 'translate-x-[24px]' : 'translate-x-0'
        )}
      >
        {checked ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
      </span>
    </button>
  );
}

function SettingRow({ title, description, right }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--border-soft)] bg-[var(--surface-muted)] px-3 py-2.5">
      <div className="min-w-0">
        <div className="text-sm font-semibold leading-5 text-[var(--text-primary)]">{title}</div>
        <div className="mt-0.5 text-[11px] leading-4 text-[var(--text-muted)]">{description}</div>
      </div>
      <div className="shrink-0">{right}</div>
    </div>
  );
}

function SectionHeader({ icon, title, description }) {
  const HeaderIcon = icon;

  return (
    <div className="mb-3 flex items-center gap-2.5">
      <div className="grid h-8 w-8 place-items-center rounded-xl border border-[color:var(--border-soft)] bg-[var(--surface-muted)] text-cyan-200">
        {HeaderIcon ? <HeaderIcon className="h-4 w-4" /> : null}
      </div>
      <div>
        <div className="text-sm font-bold leading-5 text-[var(--text-primary)]">{title}</div>
        <div className="text-[11px] leading-4 text-[var(--text-muted)]">{description}</div>
      </div>
    </div>
  );
}

function ChoiceCard({ active, icon: Icon, title, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'rounded-xl border p-3 text-left transition duration-200',
        active
          ? 'border-cyan-400/35 bg-cyan-400/10 shadow-[0_0_18px_rgba(34,211,238,0.08)]'
          : 'border-[color:var(--border-soft)] bg-[var(--surface-muted)] hover:border-[color:var(--border-strong)]'
      )}
    >
      <div className="flex items-center gap-2 text-sm font-semibold leading-5 text-[var(--text-primary)]">
        {Icon ? <Icon className="h-4 w-4 text-cyan-300" /> : null}
        {title}
      </div>
      <div className="mt-1.5 text-[11px] leading-4 text-[var(--text-muted)]">{description}</div>
    </button>
  );
}

function pickEmail(user) {
  return user?.email || user?.tdmuEmail || user?.tDMUEmail || user?.schoolEmail || user?.accountEmail || '';
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [themeMode, setThemeMode] = useState(() => readUiPreference(THEME_KEY, 'dark'));
  const [profileLayout, setProfileLayout] = useState(() => readUiPreference(PROFILE_LAYOUT_KEY, 'horizontal'));
  const [iconDensity, setIconDensity] = useState(() => readUiPreference(ICON_DENSITY_KEY, 'compact'));
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
    soundNotifications: readNotificationSoundEnabled(),
  });

  const darkMode = themeMode !== 'light';

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
        const notifyPrefs =
          typeof data.notifyPrefsJson === 'string'
            ? JSON.parse(data.notifyPrefsJson || '{}')
            : data.notifyPrefsJson || {};

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
          soundNotifications: notifyPrefs.sound !== false,
        }));
      } catch (error) {
        console.error('Load settings error', error);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    applyThemePreference(themeMode);
    writeUiPreference(THEME_KEY, themeMode);
    dispatchUiPreferencesChanged({ themeMode });
  }, [themeMode]);

  useEffect(() => {
    applyProfileLayoutPreference(profileLayout);
    writeUiPreference(PROFILE_LAYOUT_KEY, profileLayout);
    dispatchUiPreferencesChanged({ profileLayout });
  }, [profileLayout]);

  useEffect(() => {
    applyIconDensityPreference(iconDensity);
    writeUiPreference(ICON_DENSITY_KEY, iconDensity);
    dispatchUiPreferencesChanged({ iconDensity });
  }, [iconDensity]);

  const effectiveUser = useMemo(() => ({ ...(user || {}), ...(profile || {}) }), [user, profile]);

  const accountName = useMemo(
    () =>
      effectiveUser?.fullName ||
      effectiveUser?.displayName ||
      effectiveUser?.username ||
      pickEmail(effectiveUser) ||
      'Tài khoản của bạn',
    [effectiveUser]
  );

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
        notifyPrefsJson: JSON.stringify({
          email: !!form.emailNotifications,
          push: !!form.pushNotifications,
          sound: !!form.soundNotifications,
          theme: themeMode,
          profileLayout,
          iconDensity,
        }),
      });

      writeNotificationSoundEnabled(form.soundNotifications);
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
            <div className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-primary)]">
              Settings
            </div>

            <h1 className="mt-3 text-xl font-black text-[var(--text-primary)] sm:text-2xl">
              Cài đặt hệ thống
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
              Tinh chỉnh giao diện, bố cục trang cá nhân và mật độ icon để phần trải nghiệm nhìn gọn và dùng được thật trên toàn app.
            </p>
          </div>

          <div className="rounded-2xl border border-[color:var(--border-soft)] bg-[var(--surface-muted)] px-4 py-3 text-xs text-[var(--text-secondary)]">
            <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
              Tài khoản
            </div>
            <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
              {accountName}
            </div>
            <div className="mt-1 text-xs text-[var(--text-muted)]">
              {accountEmail || 'Chưa có email'}
            </div>
          </div>
        </div>

        {message ? (
          <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
            {message}
          </div>
        ) : null}
      </GlassCard>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]">
        <div className="space-y-4">
          <GlassCard className="p-4 sm:p-5">
            <SectionHeader
              icon={MonitorCog}
              title="Giao diện"
              description="Theme, bố cục profile và mật độ icon."
            />

            <div className="space-y-2.5">
              <SettingRow
                title="Dark mode"
                description="Đổi nền sáng hoặc tối cho toàn ứng dụng và giữ nguyên sau khi tải lại trang."
                right={
                  <Toggle
                    checked={darkMode}
                    onChange={(value) => setThemeMode(value ? 'dark' : 'light')}
                    label="Dark mode"
                  />
                }
              />

              <div className="grid gap-2.5 sm:grid-cols-2">
                <ChoiceCard
                  active={themeMode === 'light'}
                  icon={Sun}
                  title="Chế độ sáng"
                  description="Nền sáng, tương phản nhẹ hơn để đọc ban ngày."
                  onClick={() => setThemeMode('light')}
                />

                <ChoiceCard
                  active={themeMode === 'dark'}
                  icon={Moon}
                  title="Chế độ tối"
                  description="Nền tối, hợp với giao diện hiện tại và dùng lâu đỡ chói hơn."
                  onClick={() => setThemeMode('dark')}
                />
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2">
                <ChoiceCard
                  active={profileLayout === 'horizontal'}
                  icon={LayoutPanelTop}
                  title="Profile hàng ngang"
                  description="Khối giới thiệu trên trang cá nhân được trải ngang, rõ thông tin hơn ở màn hình rộng."
                  onClick={() => setProfileLayout('horizontal')}
                />

                <ChoiceCard
                  active={profileLayout === 'stacked'}
                  icon={PanelsTopLeft}
                  title="Profile xếp dọc"
                  description="Giữ lại kiểu chia cột truyền thống nếu bạn muốn xem từng khối riêng."
                  onClick={() => setProfileLayout('stacked')}
                />
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2">
                <ChoiceCard
                  active={iconDensity === 'compact'}
                  title="Icon nhỏ gọn"
                  description="Thu gọn icon ở sidebar, header và cài đặt để giao diện thoáng hơn."
                  onClick={() => setIconDensity('compact')}
                />

                <ChoiceCard
                  active={iconDensity === 'default'}
                  title="Icon mặc định"
                  description="Giữ icon lớn hơn để dễ bấm trên màn hình cảm ứng."
                  onClick={() => setIconDensity('default')}
                />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4 sm:p-5">
            <SectionHeader
              icon={Bell}
              title="Thông báo"
              description="Email, thông báo trong app và tương tác xã hội."
            />

            <div className="space-y-2.5">
              <SettingRow
                title="Thông báo qua email"
                description="Nhận email khi có bài viết, phản hồi hoặc cập nhật quan trọng."
                right={
                  <Toggle
                    checked={form.emailNotifications}
                    onChange={(v) => setForm({ ...form, emailNotifications: v })}
                    label="Email"
                  />
                }
              />

              <SettingRow
                title="Thông báo trong ứng dụng"
                description="Hiển thị ngay trên thanh thông báo khi có tương tác mới."
                right={
                  <Toggle
                    checked={form.pushNotifications}
                    onChange={(v) => setForm({ ...form, pushNotifications: v })}
                    label="Push"
                  />
                }
              />

              <SettingRow
                title={
                  <span className="inline-flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-cyan-300" />
                    Âm thanh thông báo
                  </span>
                }
                description="Phát âm riêng cho tin nhắn, thông báo và chuông cuộc gọi đến."
                right={
                  <Toggle
                    checked={form.soundNotifications}
                    onChange={(v) => {
                      setForm({ ...form, soundNotifications: v });
                      writeNotificationSoundEnabled(v);
                    }}
                    label="Sound"
                  />
                }
              />

              <SettingRow
                title="Cho phép nhắn tin riêng"
                description="Người dùng khác có thể mở cuộc trò chuyện trực tiếp với bạn."
                right={
                  <Toggle
                    checked={form.allowDM}
                    onChange={(v) => setForm({ ...form, allowDM: v })}
                    label="DM"
                  />
                }
              />
            </div>
          </GlassCard>
        </div>

        <div className="space-y-4">
          <GlassCard className="p-4 sm:p-5">
            <SectionHeader
              icon={Shield}
              title="Quyền riêng tư"
              description="Kiểm soát hiển thị thông tin hồ sơ."
            />

            <div className="space-y-2.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Phạm vi hiển thị hồ sơ
              </label>

              <div className="grid gap-2">
                {[
                  [1, 'Công khai'],
                  [2, 'Trong trường'],
                  [3, 'Bạn bè'],
                  [4, 'Riêng tư'],
                ].map(([value, label]) => {
                  const active = Number(form.privacyLevel) === Number(value);

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm({ ...form, privacyLevel: Number(value) })}
                      className={cx(
                        'rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition duration-200',
                        active
                          ? 'border-cyan-400/35 bg-[linear-gradient(135deg,rgba(34,211,238,0.16),rgba(59,130,246,0.08))] text-[var(--text-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]'
                          : 'border-[color:var(--border-soft)] bg-[var(--surface-muted)] text-[var(--text-secondary)] hover:border-[color:var(--border-strong)]'
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2">
                <SettingRow
                  title="Hiện email"
                  description="Cho phép hiển thị email trên trang cá nhân."
                  right={
                    <Toggle
                      checked={form.showEmail}
                      onChange={(v) => setForm({ ...form, showEmail: v })}
                      label="Show email"
                    />
                  }
                />

                <SettingRow
                  title="Hiện số điện thoại"
                  description="Cho phép hiển thị số điện thoại cho người xem."
                  right={
                    <Toggle
                      checked={form.showPhoneNumber}
                      onChange={(v) => setForm({ ...form, showPhoneNumber: v })}
                      label="Show phone"
                    />
                  }
                />

                <SettingRow
                  title="Hiện ngày sinh"
                  description="Có hiển thị ngày sinh trên profile hay không."
                  right={
                    <Toggle
                      checked={form.showDateOfBirth}
                      onChange={(v) => setForm({ ...form, showDateOfBirth: v })}
                      label="Show birthday"
                    />
                  }
                />

                <SettingRow
                  title="CV public"
                  description="Cho phép người khác xem CV công khai của bạn."
                  right={
                    <Toggle
                      checked={form.isCvPublic}
                      onChange={(v) => setForm({ ...form, isCvPublic: v })}
                      label="CV public"
                    />
                  }
                />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4 sm:p-5">
            <SectionHeader
              icon={UserRoundCog}
              title="Hiển thị trang cá nhân"
              description="Bật hoặc tắt các section của hồ sơ GitHub-style."
            />

            <div className="space-y-2.5">
              {[
                ['showEducation', 'Học vấn'],
                ['showExperience', 'Kinh nghiệm'],
                ['showCertificates', 'Chứng chỉ'],
                ['showProjects', 'Dự án'],
                ['showContributionHeatmap', 'Contribution heatmap'],
                ['showGitHubStyleProfile', 'Bố cục GitHub-style'],
                ['allowCvDownload', 'Cho phép tải CV'],
              ].map(([key, label]) => (
                <SettingRow
                  key={key}
                  title={label}
                  description={`Bật hoặc tắt phần ${label.toLowerCase()} trên trang cá nhân.`}
                  right={
                    <Toggle
                      checked={!!form[key]}
                      onChange={(v) => setForm({ ...form, [key]: v })}
                      label={label}
                    />
                  }
                />
              ))}
            </div>
          </GlassCard>

          <div className="flex flex-wrap justify-end gap-2.5">
            <button
              type="button"
              onClick={handleLogout}
              className="ui-danger-soft inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition"
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </button>

            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}