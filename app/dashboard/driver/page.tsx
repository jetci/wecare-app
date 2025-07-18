'use client';
import React from 'react';
import RoleGuard from '@/components/RoleGuard';
import { Role } from '@/types/roles';

export default function DriverDashboardPage() {
  return (
    <RoleGuard allowedRoles={[Role.DRIVER, Role.DEVELOPER]}>
      {/* TODO: Implement Driver Dashboard UI */}
      <div className="p-4 text-center">
        <h1 className="text-2xl font-bold">Driver Dashboard</h1>
        <p>Driver Dashboard coming soon...</p>
      </div>
    </RoleGuard>
  );
}
