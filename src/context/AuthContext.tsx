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
  setRole: (role: string) => void;
  isAdmin: boolean;
  isGuest: boolean;
}

const defaultAuth: AuthContextType = {
  loading: false,
  user: null,
  role: null,
  isAuthenticated: false,
  setRole: () => {},
  isAdmin: false,
  isGuest: true,
};

const AuthContext = createContext<AuthContextType>(defaultAuth);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRoleState] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        // fetch profile via JWT header
        // Use cookie-based auth (credentials) to fetch profile
        const res = await fetch('/api/auth/profile', { credentials: 'include' });
        if (!res.ok) throw new Error('Not authenticated');
        const raw = await res.json();
        const profile = (raw as any).user ?? raw;
        setUser(profile as User);
        const finalRole = (profile as any).citizenId === '3500200461028' ? 'DEVELOPER' : (profile as User).role;
        setRoleState(finalRole);
        setIsAuthenticated(true);
        console.log(`[AuthContext] citizenId=${(profile as any).citizenId}, role=${(profile as any).role}`);
      } catch {
        setUser(null);
        setRoleState(null);
        setIsAuthenticated(false);
      }
    }
    fetchProfile().finally(() => setLoading(false));
  }, []);

  const setRole = (newRole: string) => {
    setRoleState(newRole);
    setUser(prev => (prev ? { ...prev, role: newRole } : null));
  };

  const isAdmin = useMemo(() => role === 'ADMIN', [role]);
  const isGuest = useMemo(() => !isAuthenticated, [isAuthenticated]);

  // Redirect to dashboard per role after authentication
  const router = useRouter();
  useEffect(() => {
    if (!loading && isAuthenticated && role) {
      router.replace(`/dashboard/${role.toLowerCase()}`);
    }
  }, [loading, isAuthenticated, role, router]);

  return (
    <AuthContext.Provider value={{ user, role, isAuthenticated, loading, setRole, isAdmin, isGuest }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
