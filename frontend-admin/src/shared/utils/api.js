export function unwrap(payload) {
  if (payload == null) return payload;
  if (payload.data !== undefined) return unwrap(payload.data);
  return payload;
}

export function toArray(payload) {
  const raw = unwrap(payload);
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.items)) return raw.items;
  if (Array.isArray(raw?.records)) return raw.records;
  if (Array.isArray(raw?.results)) return raw.results;
  if (Array.isArray(raw?.rows)) return raw.rows;
  return [];
}

export function toObject(payload) {
  const raw = unwrap(payload);
  return raw && typeof raw === 'object' ? raw : {};
}

export function pickMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    'Yêu cầu thất bại.'
  );
}

export function queryString(params) {
  const search = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    search.set(key, value);
  });
  const text = search.toString();
  return text ? `?${text}` : '';
}
