"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { ApiProfile } from '@/types/api';

// Use ApiProfile from API for user context
export type User = ApiProfile;

export interface AuthContextType {
  loading: boolean;
  user: User | null;
  role: string | null;
  isAuthenticated: boolean;
  login: (accessToken: string, user: User) => void;
  logout: () => void;
  setRole: (role: string) => void;
  isAdmin: boolean;
  isGuest: boolean;
}

const defaultAuth: AuthContextType = {
  loading: true, // Start with loading true
  user: null,
  role: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  setRole: () => {},
  isAdmin: false,
  isGuest: true,
};

const AuthContext = createContext<AuthContextType>(defaultAuth);

// Custom hook for using auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRoleState] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchProfile() {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        // No token found, so the user is not authenticated.
        setIsAuthenticated(false);
        setUser(null);
        setRoleState(null);
        // No need to throw an error, just finish loading as a guest.
        return; 
      }

      try {
        const res = await fetch('/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          // If the token is invalid or expired, the API will return a 401.
          // We should clear the bad token from storage.
          localStorage.removeItem('accessToken');
          throw new Error('Not authenticated or token expired');
        }
        const raw = await res.json();
        const profile = (raw as any).user ?? raw;
        setUser(profile as User);
        const finalRole = (profile as User).role;
        setRoleState(finalRole);
        setIsAuthenticated(true);
      } catch (error) {
        setUser(null);
        setRoleState(null);
        setIsAuthenticated(false);
      }
    }
    fetchProfile().finally(() => setLoading(false));
  }, []);

  const login = (accessToken: string, userData: User) => {
    localStorage.setItem('accessToken', accessToken);
    setUser(userData);
    const finalRole = userData.role;
    setRoleState(finalRole);
    setIsAuthenticated(true);
    const roleToPath: Record<string, string> = {
      COMMUNITY: '/dashboard/community',
      DRIVER: '/dashboard/driver',
      OFFICER: '/dashboard/health-officer',
      EXECUTIVE: '/dashboard/executive',
      ADMIN: '/dashboard/admin',
      DEVELOPER: '/dashboard/developer',
    };
    const redirectPath = roleToPath[finalRole.toUpperCase()] || '/dashboard/community';
    router.push(redirectPath);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
    setRoleState(null);
    setIsAuthenticated(false);
    router.push('/login');
  };

  const setRole = (newRole: string) => {
    setRoleState(newRole);
    setUser(prev => (prev ? { ...prev, role: newRole } : null));
  };

  const isAdmin = useMemo(() => role === 'ADMIN', [role]);
  const isGuest = useMemo(() => !isAuthenticated, [isAuthenticated]);

  return (
    <AuthContext.Provider value={{ user, role, isAuthenticated, loading, login, logout, setRole, isAdmin, isGuest }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
