"use client";
import React from 'react';
import RoleGuard from '../../../components/RoleGuard';
import { Role } from '../../../types/roles';
import { useProfile } from '../../../hooks/useProfile';
import { useRides } from '../../../hooks/useRides';
import { Spinner } from '@/components/ui/Spinner';
import { KpiCard } from '../../../components/dashboard/KpiCard';
import RideTable from '../../../components/dashboard/RideTable';

export default function DriverDashboardPage() {
  const { profile, isLoading: loadingProfile } = useProfile();
  const { rides, isLoading: loadingRides } = useRides(profile?.id ?? null);

  if (loadingProfile || loadingRides) {
    return <Spinner data-testid="spinner" />;
  }
  const counts = {
    pending: rides.filter(r => r.status === 'PENDING').length,
    inProgress: rides.filter(r => r.status === 'IN_PROGRESS').length,
    completed: rides.filter(r => r.status === 'COMPLETED').length,
  };

  return (
    <RoleGuard allowedRoles={[Role.DRIVER]}>
      <div data-testid="driver-dashboard" className="p-4">
        <h1 className="text-2xl font-bold mb-4">Driver Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <KpiCard testId="kpi-pending" title="รอรับงาน" count={counts.pending} />
          <KpiCard testId="kpi-in-progress" title="กำลังดำเนินการ" count={counts.inProgress} color="bg-yellow-500" />
          <KpiCard testId="kpi-completed" title="เสร็จสิ้น" count={counts.completed} color="bg-green-500" />
        </div>
        {rides.length > 0 ? (
          <div data-testid="ride-table">
            <RideTable rides={rides} />
          </div>
        ) : (
          <div data-testid="empty-state" className="text-center py-8">ไม่มีงานที่ได้รับมอบหมาย</div>
        )}
      </div>
    </RoleGuard>
  );
}
