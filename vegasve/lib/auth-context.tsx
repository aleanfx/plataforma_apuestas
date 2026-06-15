"use client";

import * as React from "react";
import { api, getToken, getRefreshToken, setTokens, clearTokens } from "@/lib/api";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: "user" | "admin";
  balance: number; // céntimos
  bonus: number; // céntimos
  locked: number; // céntimos
};

type AuthResponse = { user: AuthUser; access: string; refresh: string };

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (name: string, email: string, password: string) => Promise<AuthUser>;
  loginWithGoogle: (credential: string) => Promise<AuthUser>;
  updateAvatar: (avatarUrl: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Al montar: si hay token, recupera la sesión vía /me.
  React.useEffect(() => {
    let active = true;
    async function bootstrap() {
      if (!getToken()) {
        setLoading(false);
        return;
      }
      try {
        const { user } = await api<{ user: AuthUser }>("/auth/me");
        if (active) setUser(user);
      } catch {
        clearTokens();
      } finally {
        if (active) setLoading(false);
      }
    }
    bootstrap();
    return () => {
      active = false;
    };
  }, []);

  const login = React.useCallback(async (email: string, password: string) => {
    const data = await api<AuthResponse>("/auth/login", {
      method: "POST",
      auth: false,
      body: { email, password },
    });
    setTokens(data.access, data.refresh);
    setUser(data.user);
    return data.user;
  }, []);

  const register = React.useCallback(async (name: string, email: string, password: string) => {
    const data = await api<AuthResponse>("/auth/register", {
      method: "POST",
      auth: false,
      body: { name, email, password },
    });
    setTokens(data.access, data.refresh);
    setUser(data.user);
    return data.user;
  }, []);

  const loginWithGoogle = React.useCallback(async (credential: string) => {
    const data = await api<AuthResponse>("/auth/google", {
      method: "POST",
      auth: false,
      body: { credential },
    });
    setTokens(data.access, data.refresh);
    setUser(data.user);
    return data.user;
  }, []);

  const updateAvatar = React.useCallback(async (avatarUrl: string) => {
    const { user } = await api<{ user: AuthUser }>("/auth/avatar", {
      method: "PATCH",
      body: { avatarUrl },
    });
    setUser(user);
  }, []);

  const logout = React.useCallback(async () => {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) {
        await api("/auth/logout", { method: "POST", auth: false, body: { refreshToken } });
      }
    } catch {
      /* da igual si falla; limpiamos local igual */
    }
    clearTokens();
    setUser(null);
  }, []);

  const refreshUser = React.useCallback(async () => {
    try {
      const { user } = await api<{ user: AuthUser }>("/auth/me");
      setUser(user);
    } catch {
      /* sesión perdida; el guard redirige */
    }
  }, []);

  const value = React.useMemo(
    () => ({ user, loading, login, register, loginWithGoogle, updateAvatar, logout, refreshUser }),
    [user, loading, login, register, loginWithGoogle, updateAvatar, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
