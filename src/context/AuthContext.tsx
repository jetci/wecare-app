'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface UserPayload {
  userId: string;
  role: 'ADMIN' | 'COMMUNITY' | 'DRIVER' | 'OFFICER' | 'EXECUTIVE' | 'DEVELOPER';
  nationalId?: string;
  iat: number;
  exp: number;
}

interface AuthContextType {
  user: UserPayload | null;
  token: string | null;
  loading: boolean;
  login: (newToken: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  role: UserPayload['role'] | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserPayload | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('accessToken');
      if (storedToken) {
        login(storedToken);
      } else if (process.env.NEXT_PUBLIC_DEV_USER_ID) {
        const devId = process.env.NEXT_PUBLIC_DEV_USER_ID;
        setUser({ userId: devId, role: 'DEVELOPER', iat: Date.now(), exp: Date.now() + 1000 * 60 * 60 * 24 });
      }
    } catch (err) {
      console.error("Init auth error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (newToken: string) => {
    try {
      const decoded = jwtDecode<UserPayload>(newToken);
      if (decoded.exp * 1000 < Date.now()) {
        logout();
        return;
      }
      const isDev = decoded.userId === process.env.NEXT_PUBLIC_DEV_USER_ID;
      const effectiveUser = isDev
        ? { ...decoded, role: 'DEVELOPER' as const }
        : decoded;
      setUser(effectiveUser);
      setToken(newToken);
      localStorage.setItem('accessToken', newToken);
    } catch (err) {
      console.error("Login decode error:", err);
      logout();
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('accessToken');
    if (typeof window !== 'undefined') window.location.href = '/login';
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, isAuthenticated, role: user?.role ?? null }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
