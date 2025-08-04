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
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem('accessToken');
        if (storedToken) {
          const decoded = jwtDecode<UserPayload>(storedToken);
          if (decoded.exp * 1000 > Date.now()) {
            setToken(storedToken);
            setUser(decoded);
          } else {
            // Token expired
            logout();
          }
        } else if (process.env.NEXT_PUBLIC_DEV_USER_ID) {
          const devId = process.env.NEXT_PUBLIC_DEV_USER_ID;
          setUser({ userId: devId, nationalId: devId, role: 'DEVELOPER', iat: Date.now(), exp: Date.now() + 1000 * 60 * 60 * 24 });
        }
      } catch (err) {
        console.error("Failed to initialize auth from storage:", err);
        logout(); // Clear invalid state
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (newToken: string) => {
    try {
      const decoded = jwtDecode<UserPayload>(newToken);
      if (decoded.exp * 1000 < Date.now()) {
        logout();
        throw new Error("Token has expired.");
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', newToken);
      }
      setToken(newToken);
      setUser(decoded);
    } catch (error) {
      console.error('Failed to process login:', error);
      logout(); // Ensure clean state on error
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
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
