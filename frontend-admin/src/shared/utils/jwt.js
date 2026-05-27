export function decodeJwt(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payload.padEnd(Math.ceil(payload.length / 4) * 4, '=');
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function extractRoles(source) {
  const roles = source?.roles || source?.role || source?.authorities || source?.permissions || [];
  if (Array.isArray(roles)) return roles.map((item) => String(item).toLowerCase());
  if (typeof roles === 'string') return roles.split(',').map((item) => item.trim().toLowerCase()).filter(Boolean);
  return [];
}
