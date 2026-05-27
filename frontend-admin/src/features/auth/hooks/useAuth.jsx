import { createContext, useContext, useMemo, useState } from 'react';
import { tokenStorage } from '../../../services/tokenStorage';
import { decodeJwt, extractRoles } from '../../../shared/utils/jwt';

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    return JSON.parse(window.localStorage.getItem('admin_user') || 'null');
  } catch {
    return null;
  }
}

function normalizeUser(input, token) {
  const claims = decodeJwt(token) || {};
  const user = input || {};
  const roles = Array.from(new Set([
    ...extractRoles(user),
    ...extractRoles(claims),
    String(claims?.role || '').toLowerCase(),
  ].filter(Boolean)));

  return {
    id: user.id || user.userId || claims.sub || claims.userId || claims.id || null,
    userId: user.userId || user.id || claims.sub || claims.userId || claims.id || null,
    email: user.email || claims.email || null,
    username: user.username || claims.username || null,
    fullName: user.fullName || user.full_name || claims.name || null,
    roles,
    raw: user,
  };
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => tokenStorage.get());
  const [user, setUser] = useState(() => normalizeUser(readStoredUser(), tokenStorage.get()));
  const [isLoading] = useState(false);

  const value = useMemo(() => ({
    token,
    user,
    isLoading,
    isAuthenticated: Boolean(token),
    hasRole(role) {
      return user?.roles?.includes(String(role).toLowerCase());
    },
    setSession(nextToken, nextUser) {
      tokenStorage.set(nextToken);
      const normalizedUser = normalizeUser(nextUser, nextToken);
      window.localStorage.setItem('admin_user', JSON.stringify(nextUser || {}));
      setToken(nextToken);
      setUser(normalizedUser);
    },
    logout() {
      tokenStorage.clear();
      window.localStorage.removeItem('admin_user');
      setToken(null);
      setUser(null);
    },
  }), [token, user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
