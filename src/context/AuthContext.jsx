import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "@/api/auth.api";
import { ApiError, getCsrfToken } from "@/api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshUser = useCallback(async () => {
    const currentUser = await authApi.me();
    setUser(currentUser);
    return currentUser;
  }, []);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        await getCsrfToken();
        const currentUser = await authApi.me();
        if (active) setUser(currentUser);
      } catch (err) {
        if (active && !(err instanceof ApiError && err.status === 401)) {
          setError(err);
        }
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    setError(null);
    const response = await authApi.login(credentials);
    setUser(response.user);
    return response;
  }, []);

  const register = useCallback(async (payload) => {
    setError(null);
    const response = await authApi.register(payload);
    setUser(response.user);
    return response;
  }, []);

  const logout = useCallback(async () => {
    setError(null);
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(() => {
    const role = user?.metadata?.role || user?.role || null;
    const accountStatus = user?.metadata?.accountStatus || user?.account_status || null;

    return {
      user,
      loading,
      error,
      isAuthenticated: Boolean(user),
      role,
      accountStatus,
      isAdmin: role === "admin",
      login,
      register,
      logout,
      refreshUser,
    };
  }, [user, loading, error, login, register, logout, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider.");
  return context;
}
