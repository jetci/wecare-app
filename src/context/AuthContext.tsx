'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface UserPayload {
  userId: string;
  role: 'ADMIN' | 'COMMUNITY' | 'DRIVER' | 'OFFICER' | 'DEVELOPER';
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
    console.log('[AuthContext] Initializing... Checking localStorage.');
    try {
      const storedToken = localStorage.getItem('accessToken');
      if (storedToken) {
        console.log('[AuthContext] Found token in localStorage. Attempting to login...');
        login(storedToken);
      } else {
        console.log('[AuthContext] No token found in localStorage.');
      }
    } catch (error) {
      console.error("[AuthContext] Error reading from localStorage", error);
    } finally {
      console.log('[AuthContext] Initialization finished. setLoading(false).');
      setLoading(false);
    }
  }, []);

  const login = (newToken: string) => {
    console.log('[AuthContext] login() called.');
    try {
      const decoded = jwtDecode<UserPayload>(newToken);
      console.log('[AuthContext] Token decoded successfully:', decoded);

      // ตรวจสอบว่า Token หมดอายุหรือไม่
      if (decoded.exp * 1000 < Date.now()) {
        console.error('[AuthContext] TOKEN EXPIRED. Logging out.');
        logout();
        return;
      }

      const isDeveloper = decoded.userId === process.env.NEXT_PUBLIC_DEV_USER_ID;
      if (isDeveloper) console.log('[AuthContext] Developer God Mode ACTIVATED.');
      const effectiveUser = isDeveloper ? { ...decoded, role: 'DEVELOPER' as const } : decoded;
      
      console.log('[AuthContext] Setting user and token state.');
      setUser(effectiveUser);
      setToken(newToken);
      localStorage.setItem('accessToken', newToken);
    } catch (error) {
      console.error("[AuthContext] FAILED to decode token. Logging out.", error);
      logout();
    }
  };

  const logout = () => {
    console.log('[AuthContext] logout() called. Clearing state and localStorage.');
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
  };

  const isAuthenticated = !!user;

  console.log('[AuthContext] Provider rendering with state:', { loading, isAuthenticated, user: user?.userId, role: user?.role });

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated, role: user?.role ?? null }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
