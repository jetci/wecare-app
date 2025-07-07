"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { key: "", label: "Home", href: "/dashboard/developer" },
  { key: "system-health", label: "สถานะระบบ", href: "/dashboard/developer/system-health" },
  { key: "logs", label: "บันทึกและมอนิเตอร์", href: "/dashboard/developer/logs" },
  { key: "api-explorer", label: "API Explorer", href: "/dashboard/developer/api-explorer" },
  { key: "feature-flags", label: "Feature Flags", href: "/dashboard/developer/feature-flags" },
  { key: "jobs", label: "งานพื้นหลัง", href: "/dashboard/developer/jobs" },
  { key: "db-admin", label: "Database Admin", href: "/dashboard/developer/db-admin" },
  { key: "cache", label: "จัดการแคช", href: "/dashboard/developer/cache" },
  { key: "deployments", label: "การเผยแพร่", href: "/dashboard/developer/deployments" },
  { key: "config", label: "ตั้งค่า & ความลับ", href: "/dashboard/developer/config" },
  { key: "docs", label: "เอกสาร", href: "/dashboard/developer/docs" },
  { key: "impersonation", label: "สลับบัญชี", href: "/dashboard/developer/impersonation" },
  { key: "alerts", label: "แจ้งเตือน", href: "/dashboard/developer/alerts" },
];

type Props = { children: React.ReactNode };
export default function DeveloperLayout({ children }: Props) {
  const pathname = usePathname();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Developer Dashboard</h1>
      <div className="flex space-x-4 border-b mb-4">
        {tabs.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`pb-2 ${pathname === href ? "border-b-2 border-blue-600" : "text-gray-600"}`}
          >
            {label}
          </Link>
        ))}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}
