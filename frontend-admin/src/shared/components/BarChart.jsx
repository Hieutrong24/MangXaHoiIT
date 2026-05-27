import { clampPercent, formatNumber } from '../utils/format';

export function BarChart({ items = [], emptyLabel = 'Chưa có dữ liệu', compact = false }) {
  if (!items.length) return <div className="empty-inline">{emptyLabel}</div>;
  const max = Math.max(...items.map((item) => Number(item.value) || 0), 1);
  return (
    <div className={`bar-chart ${compact ? 'compact' : ''}`}>
      {items.map((item) => {
        const raw = Number(item.value) || 0;
        const width = clampPercent((raw / max) * 100);
        return (
          <div className="bar-row" key={item.label}>
            <div className="bar-copy">
              <span className="bar-label">{item.label}</span>
              <span className="bar-value">{formatNumber(raw)}</span>
            </div>
            <div className="bar-track"><span className="bar-fill" style={{ width: `${Math.max(width, raw > 0 ? 8 : 0)}%` }} /></div>
          </div>
        );
      })}
    </div>
  );
}

export function DonutChart({ value = 0, total = 100, label = '', sublabel = '' }) {
  const safeTotal = Number(total) > 0 ? Number(total) : 100;
  const raw = Number(value) || 0;
  const percent = clampPercent((raw / safeTotal) * 100);
  return (
    <div className="donut-wrap">
      <div className="donut-chart" style={{ background: `conic-gradient(var(--accent) 0 ${percent}%, rgba(148,163,184,0.12) ${percent}% 100%)` }}>
        <div className="donut-center">
          <strong>{percent}%</strong>
          <span>{label}</span>
        </div>
      </div>
      {sublabel ? <div className="muted tiny">{sublabel}</div> : null}
    </div>
  );
}
