import { initials } from '../utils/format';

export default function AvatarStatus({ name, subtitle, online = true, size = 'md' }) {
  const text = initials(name || subtitle || 'Admin');
  return (
    <div className={`avatar-chip avatar-${size}`}>
      <div className="avatar-circle">{text}</div>
      <div className="avatar-copy">
        <div className="avatar-name">{name || 'Administrator'}</div>
        <div className="avatar-subtitle">
          <span className={`online-dot ${online ? 'is-online' : ''}`} />
          {subtitle || 'Online'}
        </div>
      </div>
    </div>
  );
}
