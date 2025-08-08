"use client";
import { ClientOnly } from '@/components/auth/ClientOnly';
import React from 'react';
import { Sidebar } from './Sidebar';
import Navbar from './Navbar';

interface AppShellProps { children: React.ReactNode }

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen flex bg-[#E3F2FD] dark:bg-gray-900">
      <ClientOnly>
        <Sidebar />
      </ClientOnly>
      <div className="flex flex-col flex-1">
        <Navbar />
        <main className="p-4 flex-1 overflow-auto">
          <div className="lg:col-span-12 mt-16">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
