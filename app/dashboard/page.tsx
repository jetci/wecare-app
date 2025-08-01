'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Role } from '@prisma/client';

export default function DashboardRootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    switch (user.role!) {
      case Role.ADMIN:
        router.replace('/dashboard/admin');
        break;
      case Role.DRIVER:
        router.replace('/dashboard/driver');
        break;
      case Role.COMMUNITY:
        router.replace('/dashboard/community');
        break;
      case Role.HEALTH_OFFICER:
      case Role.EXECUTIVE:
        router.replace('/dashboard/community');
        break;
      case Role.DEVELOPER:
        router.replace('/dashboard/developer');
        break;
        break;
      default:
        router.replace('/dashboard/driver');
    }
  }, [user, loading, router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-600">กำลังโหลด...</p>
    </div>
  );
}
