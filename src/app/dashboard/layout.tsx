'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Sidebar, SidebarMobile } from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

type Props = { children: React.ReactNode };

const LoadingScreen = () => (
  <div className="flex h-screen items-center justify-center bg-gray-100">
    <p>Loading...</p>
  </div>
);

export default function DashboardLayout({ children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      const loginUrl = new URL('/login', window.location.origin);
      loginUrl.searchParams.set('callbackUrl', pathname);
      router.push(loginUrl.toString());
    }
  }, [loading, isAuthenticated, router, pathname]);

  if (loading || !isAuthenticated) {
    return <LoadingScreen />;
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-100">
        <SidebarMobile
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <Sidebar />
        <div className="lg:pl-72">
          <Header setSidebarOpen={setSidebarOpen} />
          <main className="py-10">
            <div className="px-4 sm:px-6 lg:px-8">{children}</div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}