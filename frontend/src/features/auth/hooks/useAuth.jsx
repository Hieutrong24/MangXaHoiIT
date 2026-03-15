import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { tokenStorage } from "../../../services/tokenStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(tokenStorage.get());
  const [user, setUser] = useState(() => {
 
    return token ? { username: "sockio", displayName: "Sinh viên IT" } : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const value = useMemo(() => {
    const isAuthenticated = !!token;

    return {
      token,
      user,
      isAuthenticated,
      isLoading,
      setSession(nextToken, nextUser) {
        setToken(nextToken);
        tokenStorage.set(nextToken);
        setUser(nextUser);
      },
      logout() {
        setToken(null);
        tokenStorage.clear();
        setUser(null);
      },
    };
  }, [token, user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
