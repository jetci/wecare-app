"use client";

import React from "react";
import RoleGuard from '@/components/RoleGuard';
import { Role } from '@/types/roles';
import Link from 'next/link';

type Props = { children: React.ReactNode };

export default function CommunityLayout({ children }: Props) {
  return (
    <RoleGuard allowedRoles={[Role.COMMUNITY]}>
      <div className="p-6">
        <nav className="mb-4">
          <Link href="/dashboard/community" className="text-blue-500 hover:underline">← กลับหน้าหลัก</Link>
        </nav>
        <h1 className="text-2xl font-semibold mb-4">Community Dashboard</h1>
        {children}
      </div>
    </RoleGuard>
  );
}
