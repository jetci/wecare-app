'use client';
import React from 'react';
import RoleGuard from '@/components/RoleGuard';
import { Role } from '@/types/roles';

import DriverDashboard from '@/components/dashboard/DriverDashboard';

export default function DriverDashboardPage() {
  return (
    <RoleGuard allowedRoles={[Role.DRIVER, Role.DEVELOPER]}>
        <DriverDashboard />
    </RoleGuard>
  );
}
