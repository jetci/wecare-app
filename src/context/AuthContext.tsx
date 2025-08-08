"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { ApiProfile } from '@/types/api';
import { apiFetch } from '@/lib/apiFetch';

export type User = ApiProfile;

export interface AuthContextType {
  loading: boolean;
  user: User | null;
  role: string | null;
  isAuthenticated: boolean;
  login: (user: User) => void; // No longer needs accessToken
  logout: () => void;
  setRole: (role: string) => void;
  isAdmin: boolean;
  isGuest: boolean;
  initialChecked: boolean;
}

const defaultAuth: AuthContextType = {
  loading: true, // Always start with loading true
  user: null,
  role: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  setRole: () => {},
  isAdmin: false,
  isGuest: true,
  initialChecked: false, // Start with false, so we show a loading state
};

const AuthContext = createContext<AuthContextType>(defaultAuth);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRoleState] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialChecked, setInitialChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      console.log('[AuthContext] Attempting to fetch profile via cookie...');
      try {
        const response = await apiFetch('/api/auth/profile');
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        // The actual user data might be nested inside a 'user' property
        const profile: User = data.user || data;

        console.log('[AuthContext] Profile fetched successfully:', profile);
        setUser(profile);
        setRoleState(profile.role);
        setIsAuthenticated(true);
      } catch (error) {
        console.log('[AuthContext] No active session found or error fetching profile.');
        setUser(null);
        setRoleState(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
        setInitialChecked(true); // Mark initial check as complete
      }
    };

    fetchUserProfile();
  }, []); // Run only once on initial client-side mount

  const login = (userData: User) => {
    console.log('[AuthContext] Login successful, updating state and redirecting.');
    // The HttpOnly cookie is already set by the /api/login endpoint.
    // We just need to update the client-side state and redirect.
    setUser(userData);
    setRoleState(userData.role);
    setIsAuthenticated(true);

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

  const logout = async () => {
    console.log('[AuthContext] Logout function called.');
    try {
      // Call the backend to clear the HttpOnly cookie.
      // This is more secure than just clearing client-side state.
      await apiFetch('/api/logout', { method: 'POST' });
    } catch (error) {
      console.error('[AuthContext] Error calling logout API:', error);
    } finally {
      // Clear client state regardless of API call success and redirect.
      setUser(null);
      setRoleState(null);
      setIsAuthenticated(false);
      router.push('/login');
    }
  };

  const setRole = (newRole: string) => {
    setRoleState(newRole);
    setUser(prev => (prev ? { ...prev, role: newRole } : null));
  };

  const isAdmin = useMemo(() => role === 'ADMIN', [role]);
  const isGuest = useMemo(() => !isAuthenticated, [isAuthenticated]);

  const authValue = useMemo(() => ({
    user,
    role,
    isAuthenticated,
    loading,
    login,
    logout,
    setRole,
    isAdmin,
    isGuest,
    initialChecked,
  }), [user, role, isAuthenticated, loading, isAdmin, isGuest, initialChecked]);

  // This guard clause is crucial for preventing hydration mismatch.
  // It ensures that the children are not rendered on the client until the initial auth check is complete.
  if (!initialChecked) {
    return (
      <div suppressHydrationWarning={true} className="flex items-center justify-center min-h-screen w-full">
        <p>Initializing Authentication...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
