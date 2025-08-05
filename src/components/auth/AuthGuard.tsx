'use client';
import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

const LoadingScreen = () => (
  <div className="flex h-screen items-center justify-center bg-gray-100">
    <p>Loading...</p>
  </div>
);

const PUBLIC_ROUTES = ['/login', '/register'];

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, loading, role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return; // Do nothing while loading

    const isPublicPath = PUBLIC_ROUTES.includes(pathname);

    // Case 1: User is authenticated
    if (isAuthenticated && user && role) {
      // If on a public path (like /login), redirect to their dashboard
      if (isPublicPath) {
        const destination = `/dashboard/${role.toLowerCase()}`;
        console.log(`✅ User is authenticated. Redirecting from public route to ${destination}`);
        router.push(destination);
      }
    } 
    // Case 2: User is not authenticated
    else {
      // If on a protected path, redirect to login
      if (!isPublicPath) {
        console.log('User not authenticated. Redirecting to /login');
        router.push('/login');
      }
    }
  }, [loading, isAuthenticated, user, role, router, pathname]);

  // Render a loading screen while auth state is being determined,
  // or if a redirect is in progress.
  if (loading || (!isAuthenticated && !PUBLIC_ROUTES.includes(pathname))) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
};
