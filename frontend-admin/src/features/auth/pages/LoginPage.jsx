import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth.api';
import { useAuth } from '../hooks/useAuth.jsx';
import { pickMessage } from '../../../shared/utils/api';
import AppIcon from '../../../shared/components/AppIcon.jsx';

function pickToken(data) {
  return data?.accessToken || data?.token || data?.data?.accessToken || data?.data?.token || null;
}

function pickUser(data) {
  return data?.user || data?.data?.user || data?.account || data?.data?.account || null;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession } = useAuth();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await authApi.login({ email, password });
      const token = pickToken(data);
      const user = pickUser(data);
      if (!token) throw new Error('Backend không trả access token.');
      setSession(token, user);
      const target = location.state?.from?.pathname || '/';
      navigate(target, { replace: true });
    } catch (error) {
      setError(pickMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-card">
      <div className="login-card-head login-card-head-grid">
        <div>
          <div className="eyebrow">Quản trị hệ thống</div>
          <h2>Đăng nhập quản trị</h2>
          <p>Truy cập trung tâm điều hành để quản lý người dùng, kiểm duyệt nội dung và theo dõi trạng thái nền tảng.</p>
        </div>
        <div className="surface-pill"><AppIcon name="lock" size={14} /> Truy cập quản trị an toàn</div>
      </div>

      <div className="login-micro-stats">
        <div className="login-micro-stat">
          <span className="eyebrow">Phân hệ</span>
          <strong>User + Content</strong>
        </div>
        <div className="login-micro-stat">
          <span className="eyebrow">Trạng thái</span>
          <strong>Realtime Ops</strong>
        </div>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <label className="input-shell">
          <span>Email</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" />
        </label>
        <label className="input-shell">
          <span>Mật khẩu</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </label>
        <div className="login-helper-row">
          <div className="muted small">Phiên sẽ được lưu trên thiết bị này sau khi đăng nhập thành công.</div>
        </div>
        {error ? <div className="alert alert-error">{error}</div> : null}
        <button className="primary-action full" disabled={loading}><AppIcon name="lock" size={16} />{loading ? 'Đang đăng nhập...' : 'Đăng nhập vào hệ thống'}</button>
      </form>
    </div>
  );
}
