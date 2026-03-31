import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, storage } from '../api/client';
import type { User } from '../types';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const stored = await storage.getUser();
        if (stored) {
          setUser(stored);
        }

        const me = await authApi.me();
        setUser(me);
      } catch {
        await storage.clear();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    void bootstrap();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      async login(email, password) {
        const nextUser = await authApi.login(email, password);
        setUser(nextUser);
      },
      async logout() {
        await authApi.logout();
        setUser(null);
      },
      async refreshMe() {
        const me = await authApi.me();
        setUser(me);
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
