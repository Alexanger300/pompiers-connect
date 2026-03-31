import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { User, UserRole } from '@/types';
import { authApi, tokenStorage } from '@/lib/api';

interface RegisterPayload {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  telephone?: string;
  deviceName?: string;
  role?: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
  register: (payload: RegisterPayload) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => tokenStorage.getUser());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const access = tokenStorage.getAccessToken();
      const refresh = tokenStorage.getRefreshToken();

      if (!access && !refresh) {
        setIsLoading(false);
        return;
      }

      try {
        const me = await authApi.me();
        setUser(me);
      } catch {
        tokenStorage.clear();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void bootstrap();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const loggedUser = await authApi.login(email, password);
      setUser(loggedUser);
      return true;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const refreshMe = async () => {
    const me = await authApi.me();
    setUser(me);
  };

  const register = async (payload: RegisterPayload) => {
    try {
      const createdUser = await authApi.register(payload);
      setUser(createdUser);
      return true;
    } catch {
      return false;
    }
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      refreshMe,
      register,
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};