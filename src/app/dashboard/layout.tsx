'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { Sidebar, SidebarMobile } from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

type Props = { children: React.ReactNode };

const LoadingScreen = () => (
  <div className="flex h-screen items-center justify-center bg-gray-100">
    <p>Loading...</p>
  </div>
);

function DashboardLayout({ children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);


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
            <div className="px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}

// Wrap the layout with AuthProvider to ensure context is available to all children
export default function DashboardLayoutWrapper({ children }: Props) {
  return (
    <AuthProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthProvider>
  );
}