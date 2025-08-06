"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
  initialChecked: boolean;
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
  initialChecked: false,
};

const AuthContext = createContext<AuthContextType>(defaultAuth);

// Custom hook for using auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRoleState] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialChecked, setInitialChecked] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const fetchProfile = async () => {
    console.log('[AuthContext] Attempting to fetch profile...');
    setLoading(true);
    let token = localStorage.getItem('accessToken');
    console.log('[AuthContext] (Dev.16) Read token from localStorage:', token);

    // SA Recommendation: Retry once if token is not found immediately
    if (!token) {
      await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms
      token = localStorage.getItem('accessToken');
      console.log('[AuthContext] Retried reading token from localStorage:', token);
    }

    if (!token) {
      console.log('[AuthContext] No token after retry. Setting to guest state.');
      setUser(null);
      setRoleState(null);
      setIsAuthenticated(false);
      return; // setLoading and setInitialChecked is handled in finally
    }

    try {
      const res = await fetch('/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error('[AuthContext] Profile fetch failed, token might be invalid. Logging out.');
        logout(); // This will clear state and redirect
        throw new Error('Not authenticated or token expired');
      }

      const raw = await res.json();
      const profile = (raw as any).user ?? raw;
      console.log('[AuthContext] Profile fetched successfully:', profile);
      setUser(profile as User);
      setRoleState(profile.role);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('[AuthContext] Error in fetchProfile:', error);
      // Ensure clean state on error
      setUser(null);
      setRoleState(null);
      setIsAuthenticated(false);
    } finally {
      console.log('[AuthContext] Finished profile fetch attempt. Loading set to false.');
      setLoading(false);
      setInitialChecked(true); // Mark initial check as complete
    }
  };

  useEffect(() => {
    // SA-X: Do not run fetch logic on the login page to prevent race conditions.
    if (pathname === '/login') {
      setLoading(false); // Ensure loading is false on login page
      setInitialChecked(true); // Login page doesn't need auth check, so mark as done
      return;
    }

    // Listen for custom auth change events
    const handleAuthChange = () => {
      console.log('[AuthContext] Detected authChange event, re-fetching profile.');
      fetchProfile();
    };

    window.addEventListener('authChange', handleAuthChange);

    // Initial fetch on mount (for non-login pages)
    fetchProfile();

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, [pathname]); // Re-run when path changes

  const login = (accessToken: string, userData: User) => {
    console.log('[AuthContext] Login function called.');
    localStorage.setItem('accessToken', accessToken);
    // Instead of setting state directly, dispatch an event to trigger a re-fetch.
    // This ensures a single source of truth for the user state (the fetchProfile function).
    window.dispatchEvent(new CustomEvent('authChange'));
    const roleToPath: Record<string, string> = {
      COMMUNITY: '/dashboard/community',
      DRIVER: '/dashboard/driver',
      OFFICER: '/dashboard/health-officer',
      EXECUTIVE: '/dashboard/executive',
      ADMIN: '/dashboard/admin',
      DEVELOPER: '/dashboard/developer',
    };
    const redirectPath = roleToPath[userData.role.toUpperCase()] || '/dashboard/community';
    router.push(redirectPath);
  };

  const logout = () => {
    console.log('[AuthContext] Logout function called.');
    localStorage.removeItem('accessToken');
    // Dispatch event to ensure state is cleared via the listener
    window.dispatchEvent(new CustomEvent('authChange'));
    router.push('/login');
  };

  const setRole = (newRole: string) => {
    setRoleState(newRole);
    setUser(prev => (prev ? { ...prev, role: newRole } : null));
  };

  const isAdmin = useMemo(() => role === 'ADMIN', [role]);
  const isGuest = useMemo(() => !isAuthenticated, [isAuthenticated]);

  return (
    <AuthContext.Provider value={{ user, role, isAuthenticated, loading, login, logout, setRole, isAdmin, isGuest, initialChecked }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
