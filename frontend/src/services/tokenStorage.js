const KEY = "sockioIT_token";
const META_KEY = "sockioIT_token_meta";

function decodeJwtPayload(token) {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const normalized = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const json = window.atob(normalized);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getTokenPayload(token) {
  if (typeof window === "undefined") return null;
  return decodeJwtPayload(token);
}

export function getTokenExpiresAt(token) {
  const payload = getTokenPayload(token);
  const exp = payload?.exp;
  return typeof exp === "number" ? exp * 1000 : null;
}

function readStoredMeta() {
  if (typeof window === "undefined") return null;

  try {
    return JSON.parse(window.localStorage.getItem(META_KEY) || "null");
  } catch {
    return null;
  }
}

function writeStoredMeta(meta) {
  if (typeof window === "undefined") return;

  if (!meta) {
    window.localStorage.removeItem(META_KEY);
    return;
  }

  window.localStorage.setItem(META_KEY, JSON.stringify(meta));
}

export const tokenStorage = {
  get() {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(KEY);
  },
  set(token) {
    if (typeof window === "undefined") return { token, expiresAt: null };

    window.localStorage.setItem(KEY, token);

    const expiresAt = getTokenExpiresAt(token);
    writeStoredMeta(expiresAt ? { expiresAt } : null);

    return { token, expiresAt };
  },
  getExpiresAt(token = null) {
    if (token) return getTokenExpiresAt(token);

    const currentToken = this.get();
    if (!currentToken) return null;

    const storedMeta = readStoredMeta();
    if (typeof storedMeta?.expiresAt === "number") return storedMeta.expiresAt;

    const expiresAt = getTokenExpiresAt(currentToken);
    if (expiresAt) writeStoredMeta({ expiresAt });
    return expiresAt;
  },
  isExpired(token = null) {
    const expiresAt = this.getExpiresAt(token);
    return typeof expiresAt === "number" ? Date.now() >= expiresAt : false;
  },
  clear() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(KEY);
    window.localStorage.removeItem(META_KEY);
  },
};
