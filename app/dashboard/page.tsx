"use client";

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { loading, isAuthenticated, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else {
        switch (role) {
          case 'COMMUNITY':
            router.replace('/dashboard/community');
            break;
          case 'DRIVER':
            router.replace('/dashboard/driver');
            break;
          case 'HEALTH_OFFICER':
            router.replace('/dashboard/health-officer');
            break;
          case 'EXECUTIVE':
            router.replace('/dashboard/executive');
            break;
          case 'ADMIN':
            router.replace('/dashboard/admin');
            break;
          case 'DEVELOPER':
            router.replace('/dashboard/developer');
            break;
          default:
            router.replace('/dashboard');
        }
      }
    }
  }, [loading, isAuthenticated, role, router]);

  return <p>กำลังไปยังหน้า Dashboard ตามบทบาท...</p>;
}
