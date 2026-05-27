import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { tokenStorage } from '../../../services/tokenStorage';

const AuthContext = createContext(null);
const AUTH_CHANGED_EVENT = 'auth:changed';
const AUTH_LOGOUT_EVENT = 'auth:logout';
const AUTH_FLASH_KEY = 'auth:flash';

function readStoredUser() {
  if (typeof window === 'undefined') return null;

  try {
    return JSON.parse(window.localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

function normalizeUser(nextUser) {
  if (!nextUser) return null;

  return {
    ...nextUser,
    id: nextUser.id || nextUser.userId || nextUser._id || null,
    userId: nextUser.userId || nextUser.id || nextUser._id || null,
  };
}

function syncStoredUser(user) {
  if (typeof window === 'undefined') return null;

  const normalizedUser = normalizeUser(user);

  if (!normalizedUser) {
    window.localStorage.removeItem('user');
    window.localStorage.removeItem('userId');
    window.localStorage.removeItem('uid');
    window.localStorage.removeItem('currentUserId');
    return null;
  }

  window.localStorage.setItem('user', JSON.stringify(normalizedUser));

  if (normalizedUser.userId) {
    const userId = String(normalizedUser.userId);
    window.localStorage.setItem('userId', userId);
    window.localStorage.setItem('uid', userId);
    window.localStorage.setItem('currentUserId', userId);
  }

  return normalizedUser;
}

function dispatchAuthChanged(detail = {}) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT, { detail }));
}

export function logout(options = {}) {
  const { reason = 'manual', redirectTo = '/auth/login', notify = false } = options;

  tokenStorage.clear();
  syncStoredUser(null);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(AUTH_LOGOUT_EVENT, {
        detail: { reason, redirectTo, notify },
      })
    );
    dispatchAuthChanged({ reason: 'logout' });
  }
}

export function AuthProvider({ children }) {
  const logoutTimerRef = useRef(null);
  const [token, setToken] = useState(() => {
    const storedToken = tokenStorage.get();
    if (!storedToken) return null;
    if (tokenStorage.isExpired(storedToken)) {
      tokenStorage.clear();
      syncStoredUser(null);
      return null;
    }
    return storedToken;
  });
  const [user, setUser] = useState(() => normalizeUser(readStoredUser()));
  const [expiresAt, setExpiresAt] = useState(() => {
    const storedToken = tokenStorage.get();
    if (!storedToken || tokenStorage.isExpired(storedToken)) return null;
    return tokenStorage.getExpiresAt(storedToken);
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    function syncFromStorage() {
      const storedToken = tokenStorage.get();
      const storedUser = normalizeUser(readStoredUser());

      if (storedToken && tokenStorage.isExpired(storedToken)) {
        logout({ reason: 'expired', notify: false });
        setToken(null);
        setUser(null);
        setExpiresAt(null);
        return;
      }

      setToken(storedToken || null);
      setUser(storedUser);
      setExpiresAt(storedToken ? tokenStorage.getExpiresAt(storedToken) : null);
    }

    syncFromStorage();
    setIsLoading(false);

    function handleStorage(event) {
      if (!event?.key || [null, 'sockioIT_token', 'sockioIT_token_meta', 'user', 'userId', 'uid', 'currentUserId'].includes(event.key)) {
        syncFromStorage();
      }
    }

    function handleAuthChanged() {
      syncFromStorage();
    }

    function handleLogoutEvent(event) {
      const reason = event?.detail?.reason || 'manual';
      const redirectTo = event?.detail?.redirectTo || '/auth/login';
      const shouldNotify = Boolean(event?.detail?.notify);
      const message = reason === 'expired'
        ? 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.'
        : reason === 'unauthorized'
          ? 'Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại.'
          : 'Bạn đã đăng xuất.';

      setToken(null);
      setUser(null);
      setExpiresAt(null);

      if (typeof window !== 'undefined') {
        const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;

        if (shouldNotify) {
          if (currentPath !== redirectTo) {
            window.sessionStorage.setItem(AUTH_FLASH_KEY, JSON.stringify({ type: 'info', message }));
          } else {
            toast.info(message);
          }
        }

        if (currentPath !== redirectTo) {
          window.location.replace(redirectTo);
        }
      }
    }

    window.addEventListener('storage', handleStorage);
    window.addEventListener(AUTH_CHANGED_EVENT, handleAuthChanged);
    window.addEventListener(AUTH_LOGOUT_EVENT, handleLogoutEvent);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(AUTH_CHANGED_EVENT, handleAuthChanged);
      window.removeEventListener(AUTH_LOGOUT_EVENT, handleLogoutEvent);
    };
  }, []);

  useEffect(() => {
    if (logoutTimerRef.current) {
      window.clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }

    if (!token || !expiresAt) return undefined;

    const remaining = expiresAt - Date.now();

    if (remaining <= 0) {
      logout({ reason: 'expired', notify: true });
      return undefined;
    }

    logoutTimerRef.current = window.setTimeout(() => {
      logout({ reason: 'expired', notify: true });
    }, remaining);

    return () => {
      if (logoutTimerRef.current) {
        window.clearTimeout(logoutTimerRef.current);
        logoutTimerRef.current = null;
      }
    };
  }, [token, expiresAt]);

  const value = useMemo(() => {
    const isAuthenticated = Boolean(token && user);

    return {
      token,
      user,
      expiresAt,
      isAuthenticated,
      isLoading,
      setSession(nextToken, nextUser) {
        const normalizedUser = syncStoredUser(nextUser);
        const sessionMeta = tokenStorage.set(nextToken);

        setToken(nextToken);
        setUser(normalizedUser);
        setExpiresAt(sessionMeta?.expiresAt || null);
        dispatchAuthChanged({ reason: 'login' });

        return {
          token: nextToken,
          user: normalizedUser,
          expiresAt: sessionMeta?.expiresAt || null,
        };
      },
      logout(options = {}) {
        logout({ notify: true, ...options });
      },
    };
  }, [token, user, expiresAt, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
