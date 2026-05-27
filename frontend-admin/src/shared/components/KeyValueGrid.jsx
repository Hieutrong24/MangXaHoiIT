import { humanizeKey, normalizeListField, summarizeObjectEntries } from '../utils/format';

function renderValue(value) {
  if (value === undefined || value === null || value === '') return '-';
  if (Array.isArray(value)) {
    const list = normalizeListField(value);
    return list.length ? (
      <div className="tag-list">
        {list.map((item) => <span className="tag" key={item}>{item}</span>)}
      </div>
    ) : '-';
  }
  if (typeof value === 'object') {
    const pairs = summarizeObjectEntries(value, 5);
    if (!pairs.length) return '-';
    return (
      <div className="mini-kv-list">
        {pairs.map(([key, item]) => (
          <div key={key} className="mini-kv-row">
            <span>{humanizeKey(key)}</span>
            <strong>{String(item)}</strong>
          </div>
        ))}
      </div>
    );
  }
  return String(value);
}

export default function KeyValueGrid({ data }) {
  const entries = Object.entries(data || {}).filter(([, value]) => value !== undefined);
  return (
    <div className="kv-grid">
      {entries.map(([key, value]) => (
        <div className="kv-item card section-card" key={key}>
          <div className="eyebrow">{humanizeKey(key)}</div>
          <div className="kv-value">{renderValue(value)}</div>
        </div>
      ))}
    </div>
  );
}
