'use client';
import React from 'react';
import { Role } from '@/types/roles';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const LoadingScreen = () => (
  <div className="flex h-screen items-center justify-center bg-gray-100">
    <p>Loading...</p>
  </div>
);

type RoleGuardProps = {
  allowedRoles: Role[];
  children: React.ReactNode;
};

export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { role, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <LoadingScreen />;
  }

  const userRole = role ? Role[role.toUpperCase() as keyof typeof Role] : undefined;

  // Developer has superuser access
  if (userRole === Role.DEVELOPER) {
    return <>{children}</>;
  }

  // Check if the user has one of the allowed roles
  const isAuthorized = userRole && allowedRoles.includes(userRole);

  if (!isAuthorized) {
    // Redirect to a safe page if not authorized. 
    // Using router.replace to avoid adding to browser history.
    if (typeof window !== 'undefined') {
      router.replace('/dashboard');
    }
    return null; // Render nothing while redirecting
  }

  return <>{children}</>;
}
