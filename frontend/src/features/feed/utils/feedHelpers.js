export function normalizePosts(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.items)) return payload.items;
  if (payload && Array.isArray(payload.data)) return payload.data;
  if (payload?.data && Array.isArray(payload.data.items)) return payload.data.items;
  return [];
}

export function cx(...arr) {
  return arr.filter(Boolean).join(" ");
}

export function safeId(p, idx) {
  return p?._id || p?.id || `${idx}`;
}

export function pickTitle(p) {
  return p?.title || (p?.content ? String(p.content).slice(0, 80) : "Bài viết");
}

export function pickExcerpt(p) {
  return p?.excerpt || (p?.content ? String(p.content).slice(0, 160) : "");
}