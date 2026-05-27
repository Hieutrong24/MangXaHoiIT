import { clampPercent, formatNumber } from '../utils/format';

export function SparklineCard({ title, value, delta, points = [] }) {
  const safe = points.length ? points : [12, 18, 16, 24, 22, 30, 28];
  const max = Math.max(...safe, 1);
  const min = Math.min(...safe, 0);
  const range = Math.max(max - min, 1);
  const d = safe.map((point, index) => {
    const x = (index / Math.max(safe.length - 1, 1)) * 100;
    const y = 42 - ((point - min) / range) * 30;
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
  return (
    <div className="trend-card">
      <div className="trend-card-copy">
        <span className="eyebrow">{title}</span>
        <strong>{formatNumber(value)}</strong>
        {delta ? <span className="trend-delta">{delta}</span> : null}
      </div>
      <svg viewBox="0 0 100 48" className="trend-sparkline" preserveAspectRatio="none" aria-hidden="true">
        <path d={d} />
      </svg>
    </div>
  );
}

export function ProgressColumns({ items = [] }) {
  if (!items.length) return <div className="empty-inline">Chưa có dữ liệu</div>;
  const max = Math.max(...items.map((item) => Number(item.value) || 0), 1);
  return (
    <div className="column-chart">
      {items.map((item) => {
        const raw = Number(item.value) || 0;
        const height = Math.max(clampPercent((raw / max) * 100), raw > 0 ? 14 : 4);
        return (
          <div className="column-item" key={item.label}>
            <div className="column-track">
              <span className="column-fill" style={{ height: `${height}%` }} />
            </div>
            <strong>{formatNumber(raw)}</strong>
            <span>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}
