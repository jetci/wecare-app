'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// This interface now represents the user object returned from our API
interface User {
  id: string;
  role: 'ADMIN' | 'COMMUNITY' | 'DRIVER' | 'OFFICER' | 'EXECUTIVE' | 'DEVELOPER';
  nationalId: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void; // Login now accepts token and user object
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  role: User['role'] | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  // Set loading to false initially, as we are not fetching data on load anymore.
  const [loading, setLoading] = useState(true); // Set loading to true initially

  useEffect(() => {
    const checkUser = async () => {
      try {
        // This endpoint should verify the token and return user data
        const response = await fetch('/api/auth/verify');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to verify user session', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  // The login function now directly receives the user object from the form.
  const login = useCallback((token: string, userData: User) => {
    console.log('📦 AuthContext: Logging in with user data:', userData);
    // The API handler now sets an HttpOnly cookie with the token.
    // Client-side, we just need to set the user state to update the UI.
    setUser(userData);
    setLoading(false);
  }, []);

  const logout = async () => {
    console.log('AuthContext: Logging out...');
    setLoading(true);
    try {
      // The API call clears the HttpOnly cookie on the server.
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('AuthContext: Error during logout API call', error);
    } finally {
      // Always clear user state on the client and redirect.
      setUser(null);
      setLoading(false);
      router.push('/login');
      console.log('AuthContext: Client state cleared and redirected to login.');
    }
  };

  // isAuthenticated is now simpler: it's true if there's a user, and we're not in a loading state.
  const isAuthenticated = !loading && !!user;

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, isAuthenticated, role: user?.role ?? null }}
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
