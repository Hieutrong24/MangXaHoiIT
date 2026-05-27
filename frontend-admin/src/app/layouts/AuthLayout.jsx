import { Outlet } from 'react-router-dom';
import AppIcon from '../../shared/components/AppIcon.jsx';

export default function AuthLayout() {
  return (
    <div className="login-screen">
      <div className="login-hero">
        <div className="login-brand">
          <div className="login-mark"><AppIcon name="spark" size={24} /></div>
          <div>
            <div className="login-brand-title">Admin Hub</div>
            <div className="login-brand-sub">Architectural Social Network</div>
          </div>
        </div>

        <div className="login-copy">
          <div className="login-panel-note"><AppIcon name="activity" size={14} /> Vận hành nền tảng</div>
          <div className="eyebrow" style={{ marginTop: 18 }}>Cổng quản trị tập trung</div>
          <h1>Trung tâm quản trị IT Social</h1>
          <p>Đăng nhập để theo dõi người dùng, nội dung, học tập và luồng vận hành realtime.</p>
        </div>

        <div className="hero-feature-list light">
          {[
            'Quản lý người dùng và code judge',
            'Theo dõi nội dung, chat và thông báo',
            'Tối ưu cho tác vụ quản trị hằng ngày',
          ].map((item) => (
            <div className="hero-feature-item" key={item}>
              <span className="hero-feature-icon"><AppIcon name="spark" size={14} /></span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="login-form-wrap">
        <Outlet />
      </div>
    </div>
  );
}
