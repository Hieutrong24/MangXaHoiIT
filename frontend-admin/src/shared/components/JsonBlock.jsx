import { humanizeKey, normalizeListField, summarizeObjectEntries } from '../utils/format';

function renderDetail(value) {
  if (value === undefined || value === null || value === '') return '-';
  if (Array.isArray(value)) {
    const list = normalizeListField(value);
    if (!list.length) return '-';
    return (
      <ul className="detail-list">
        {list.slice(0, 8).map((item) => <li key={item}>{item}</li>)}
      </ul>
    );
  }
  if (typeof value === 'object') {
    const pairs = summarizeObjectEntries(value, 8);
    if (!pairs.length) return '-';
    return (
      <div className="mini-kv-list">
        {pairs.map(([key, item]) => (
          <div className="mini-kv-row" key={key}>
            <span>{humanizeKey(key)}</span>
            <strong>{String(item)}</strong>
          </div>
        ))}
      </div>
    );
  }
  const text = String(value);
  return <div className="truncate-copy">{text}</div>;
}

export default function JsonBlock({ value }) {
  const entries = Object.entries(value || {}).filter(([, item]) => item !== undefined && item !== null && item !== '');
  if (!entries.length) {
    return <div className="empty-inline">Không có dữ liệu chi tiết.</div>;
  }
  return (
    <div className="detail-grid">
      {entries.map(([key, item]) => (
        <div className="detail-item" key={key}>
          <div className="detail-key">{humanizeKey(key)}</div>
          <div className="detail-value">{renderDetail(item)}</div>
        </div>
      ))}
    </div>
  );
}
