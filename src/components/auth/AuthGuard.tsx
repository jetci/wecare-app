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
  const { user, isAuthenticated, role, initialChecked, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  console.log('[AuthGuard] State:', { isAuthenticated, loading, initialChecked });

  useEffect(() => {
    console.log('[AuthGuard] useEffect called');
    // Wait until the initial authentication check is complete before running any redirect logic.
    if (!initialChecked) return;

    const isPublicPath = PUBLIC_ROUTES.some(path => pathname.startsWith(path));

    // Case 1: User is authenticated
    if (isAuthenticated && user && role) {
      // If on a public path (like /login), redirect to their role-specific dashboard
      if (isPublicPath) {
        const destination = `/dashboard/${role.toLowerCase()}`;
        console.log(`✅ AuthGuard: User authenticated. Redirecting from public route to ${destination}`);
        router.push(destination);
      }
    } 
    // Case 2: User is not authenticated
    else {
      // If trying to access a protected path, redirect to login
      if (!isPublicPath) {
        console.log('AuthGuard: User not authenticated. Redirecting to /login');
        router.push('/login');
      }
    }
  }, [initialChecked, isAuthenticated, user, role, router, pathname]);

  // Show a loading screen only during the very first authentication check.
  if (!initialChecked) {
    return <LoadingScreen />;
  }

  // If the initial check is done but the user is not authenticated and is on a protected route,
  // show the loading screen while the redirect to /login is in progress.
  if (!isAuthenticated && !PUBLIC_ROUTES.some(path => pathname.startsWith(path))) {
    return <LoadingScreen />;
  }

  // If checks pass, render the actual page content.
  return <>{children}</>;
};
