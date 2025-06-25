"use client";

import React from "react";
import Link from "next/link";
import { Send, Activity, Archive, UserCircle, Bell, HelpCircle, Star, Settings, UserPlus } from "lucide-react";
import DashboardLayout from "../layout";
import RoleGuard from "@/components/RoleGuard";
import { Role } from "@/types/roles";

const menuItems = [
  { title: "ขอรับบริการ", path: "/dashboard/community/request", icon: Send },
  { title: "เพิ่มผู้ป่วยในความดูแล", path: "/dashboard/community/add-patient", icon: UserPlus },
  { title: "ติดตามสถานะคำขอ", path: "/dashboard/community/track", icon: Activity },
  { title: "ประวัติการใช้บริการ", path: "/dashboard/community/history", icon: Archive },
  { title: "การแจ้งเตือน", path: "/dashboard/community/notifications", icon: Bell },
  { title: "โปรไฟล์ผู้ใช้", path: "/dashboard/community/profile", icon: UserCircle },
  { title: "ให้คะแนน", path: "/dashboard/community/feedback", icon: Star },
  { title: "FAQ", path: "/dashboard/community/help", icon: HelpCircle },
  { title: "การตั้งค่า", path: "/dashboard/community/settings", icon: Settings },
];

export default function CommunityDashboardPage() {
  return (
    <RoleGuard allowedRoles={[Role.COMMUNITY]}>
      <DashboardLayout role="community">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Community Dashboard</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {menuItems.map(({ title, path, icon: Icon }) => (
              <Link
                key={path}
                href={path}
                className="group flex flex-col items-center justify-center bg-white rounded-lg shadow-md p-6 space-y-4 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <Icon className="h-10 w-10 text-indigo-500 transition-colors duration-200 group-hover:text-indigo-600" />
                <span className="text-base font-semibold text-gray-700">{title}</span>
              </Link>
            ))}
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}