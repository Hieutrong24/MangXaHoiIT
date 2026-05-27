export const ARCH_MONITOR_EVENT = 'it-social:architecture-monitor:log';
export const ARCH_MONITOR_SOCKET_EVENT = 'it-social:architecture-monitor:socket-status';

const MAX_TEXT_LENGTH = 180;
const SENSITIVE_KEYS = [
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'authorization',
  'cookie',
  'set-cookie',
  'sourceCode',
  'code',
];

export function isArchitectureMonitorEnabled() {
  if (typeof window === 'undefined') return false;
  const envEnabled = import.meta.env.VITE_ARCH_MONITOR_ENABLED;
  if (String(envEnabled).toLowerCase() === 'false') return false;
  if (String(envEnabled).toLowerCase() === 'true') return true;
  try {
    const stored = window.localStorage.getItem('arch-monitor-enabled');
    return stored == null ? import.meta.env.DEV : stored !== 'false';
  } catch {
    return import.meta.env.DEV;
  }
}

export function setArchitectureMonitorEnabled(enabled) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem('arch-monitor-enabled', String(!!enabled));
  } catch {
    // Ignore storage restrictions.
  }
  window.dispatchEvent(new CustomEvent('it-social:architecture-monitor:toggle', { detail: { enabled: !!enabled } }));
}

export function sanitizeValue(value, key = '') {
  if (SENSITIVE_KEYS.some((item) => String(key).toLowerCase().includes(item.toLowerCase()))) {
    return '[masked]';
  }
  if (value == null) return value;
  if (typeof value === 'string') {
    return value.length > MAX_TEXT_LENGTH ? `${value.slice(0, MAX_TEXT_LENGTH)}...` : value;
  }
  if (typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.slice(0, 5).map((item) => sanitizeValue(item));

  return Object.fromEntries(
    Object.entries(value)
      .slice(0, 12)
      .map(([entryKey, entryValue]) => [entryKey, sanitizeValue(entryValue, entryKey)])
  );
}

export function createCorrelationId(prefix = 'arch') {
  try {
    return `${prefix}-${crypto.randomUUID()}`;
  } catch {
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

export function emitArchitectureLog(entry) {
  if (typeof window === 'undefined' || !isArchitectureMonitorEnabled()) return;
  const safeEntry = {
    id: createCorrelationId('log'),
    timestamp: new Date().toISOString(),
    type: 'HTTP',
    level: 'success',
    ...entry,
  };
  window.dispatchEvent(new CustomEvent(ARCH_MONITOR_EVENT, { detail: safeEntry }));
}

export function emitSocketStatus(status) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(ARCH_MONITOR_SOCKET_EVENT, { detail: status }));
}
