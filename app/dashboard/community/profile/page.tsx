"use client";
import React from 'react';
import RoleGuard from '@/components/RoleGuard';
import { Role } from '@/types/roles';

export default function CommunityProfilePage() {
  return (
    <RoleGuard allowedRoles={[Role.COMMUNITY]}>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-2">โปรไฟล์ชุมชน</h1>
        <p>หน้าสำหรับแสดงและแก้ไขโปรไฟล์</p>
      </div>
    </RoleGuard>
  );
}
