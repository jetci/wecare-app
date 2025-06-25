'use client';
import React, { useEffect } from 'react';
import { Role } from '@/types/roles';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

type RoleGuardProps = {
  allowedRoles: Role[];
  children: React.ReactNode;
};

export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user, role, isAuthenticated } = useAuth();
  const router = useRouter();

  // Wait for auth to initialize
  if (!isAuthenticated) {
    return null;
  }

  // Map role string to enum
  const userRole = role ? Role[role.toUpperCase() as keyof typeof Role] : undefined;

  // Developer bypass for all dashboards
  if (userRole === Role.DEVELOPER && user?.nationalId === '3500200461028') {
    return <>{children}</>;
  }

  // Redirect unauthorized roles
  useEffect(() => {
    if (!userRole || !allowedRoles.includes(userRole)) {
      router.replace('/dashboard');
    }
  }, [userRole, allowedRoles, router]);

  // Render allowed users
  if (userRole && allowedRoles.includes(userRole)) {
    return <>{children}</>;
  }
  return null;
}
