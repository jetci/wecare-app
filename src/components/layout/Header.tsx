'use client';

import React from 'react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';
import useSWR from 'swr';
import NotificationDropdown from '@/components/layout/NotificationDropdown';

// Fetch user profile with full name and role
interface Profile { prefix?: string; firstName: string; lastName: string; role: string }
const fetcher = (url: string) => fetch(url).then(res => res.json()) as Promise<{ user: Profile }>;

interface HeaderProps { setSidebarOpen: (open: boolean) => void }

export default function Header({ setSidebarOpen }: HeaderProps) {
  const { logout } = useAuth();
  const { data } = useSWR<{ user: Profile }>(
    '/api/auth/profile',
    fetcher
  );
  const user = data?.user;

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>
      <div className="flex flex-1 justify-end items-center space-x-4">
        {user && (
          <div className="text-sm text-right">
            <div>👤 {`${user.prefix ?? ''}${user.firstName} ${user.lastName}`}</div>
            <div>🔰 {user.role}</div>
          </div>
        )}
        <NotificationDropdown />
        <button
          onClick={logout}
          className="text-sm font-semibold text-gray-700 hover:text-gray-900"
        >
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
}


