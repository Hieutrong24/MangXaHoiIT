import { Link } from 'react-router-dom';
import AppIcon from './AppIcon.jsx';

export default function PageHeader({ title, subtitle, actionLabel, actionTo, actions, icon = 'spark' }) {
  return (
    <div className="page-hero page-hero-card">
      <div className="page-hero-leading">
        <div className="page-hero-icon"><AppIcon name={icon} size={20} /></div>
        <div>
          <h1 className="page-hero-title">{title}</h1>
          {subtitle ? <p className="page-hero-subtitle">{subtitle}</p> : null}
        </div>
      </div>
      <div className="page-hero-actions">
        {actions}
        {actionLabel && actionTo ? <Link className="primary-action" to={actionTo}><AppIcon name="plus" size={16} />{actionLabel}</Link> : null}
      </div>
    </div>
  );
}
