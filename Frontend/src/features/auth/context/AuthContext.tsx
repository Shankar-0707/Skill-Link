import React, { createContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../api/auth";
import type { AuthResponse, User } from "../types";
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
} from "../utils/tokenStorage";

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  refreshProfile: () => Promise<User | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function restoreSession() {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();

  if (!accessToken && !refreshToken) {
    return null;
  }

  try {
    return await authApi.getProfile();
  } catch {
    if (!refreshToken) {
      clearAuthTokens();
      return null;
    }

    const refreshedSession = await authApi.refresh(refreshToken);
    setAuthTokens(refreshedSession.accessToken, refreshedSession.refreshToken);
    return refreshedSession.user;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        const nextUser = await restoreSession();
        if (active) {
          setUser(nextUser);
        }
      } catch {
        clearAuthTokens();
        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setIsBootstrapping(false);
        }
      }
    };

    void bootstrap();

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isBootstrapping,
      login: async (email: string, password: string) => {
        const response = await authApi.login({ email, password });
        setAuthTokens(response.accessToken, response.refreshToken);
        setUser(response.user);
        return response;
      },
      logout: async () => {
        const refreshToken = getRefreshToken();

        try {
          if (refreshToken) {
            await authApi.logout(refreshToken);
          }
        } finally {
          clearAuthTokens();
          setUser(null);
        }
      },
      deleteAccount: async () => {
        await authApi.deleteAccount();
        clearAuthTokens();
        setUser(null);
      },
      refreshProfile: async () => {
        try {
          const profile = await authApi.getProfile();
          setUser(profile);
          return profile;
        } catch {
          clearAuthTokens();
          setUser(null);
          return null;
        }
      },
    }),
    [isBootstrapping, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
