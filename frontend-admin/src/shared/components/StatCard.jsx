import AppIcon from './AppIcon.jsx';
import { formatNumber } from '../utils/format';

export default function StatCard({ label, value, hint, icon = 'spark', tone = 'default', footer }) {
  return (
    <div className={`stitch-stat-card tone-${tone}`}>
      <div className="stitch-stat-head">
        <div className={`stitch-stat-icon tone-${tone}`}><AppIcon name={icon} size={18} /></div>
        <span className={`stitch-stat-tag tone-${tone}`}>{hint || label}</span>
      </div>
      <div className="stitch-stat-label">{label}</div>
      <div className="stitch-stat-value">{formatNumber(value ?? '-')}</div>
      {footer ? <div className="stitch-stat-footer">{footer}</div> : null}
    </div>
  );
}
