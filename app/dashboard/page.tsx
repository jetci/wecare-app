"use client";

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/Spinner';

export default function DashboardPage() {
  const { loading, isAuthenticated, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return; 
    }

    if (!isAuthenticated) {
      router.push('/login');
    } else if (role) {
      const destination = `/dashboard/${role.toLowerCase()}`;
      router.replace(destination);
    }
  }, [loading, isAuthenticated, role, router]);

  if (loading || !isAuthenticated) {
    return <Spinner />;
  }

  return <p>กำลังนำท่านไปยัง Dashboard...</p>;
}
