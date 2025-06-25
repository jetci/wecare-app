"use client";

import React, { ReactNode, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import Header from "@/components/layout/Header";
import { Role } from "@/types/roles";

const fetcher = (url: string) =>
  fetch(url, {
    headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
  }).then((res) => res.json());

const allDashboards = [
  { key: "community", title: "ประชาชน", path: "/dashboard/community" },
  { key: "driver", title: "เจ้าหน้าที่กู้ชีพ/คนขับรถ", path: "/dashboard/driver" },
  { key: "health-officer", title: "เจ้าหน้าที่สาธารณสุข", path: "/dashboard/health-officer" },
  { key: "executive", title: "ผู้บริหาร", path: "/dashboard/executive" },
  { key: "admin", title: "ผู้ดูแลระบบ", path: "/dashboard/admin" }
];

interface Props {
  children: ReactNode;
  role: string;
}

export default function DashboardLayout({ children, role }: Props) {
  const router = useRouter();
  const { data: profileRaw } = useSWR("/api/auth/profile", fetcher);
  const profile = profileRaw?.user ?? profileRaw;
  const isDevUser = profile?.nationalId === "3500200461028";

  // Sidebar items
  let sidebarItems;
  if (role === 'community') {
    // Community users see only community dashboard
    sidebarItems = allDashboards.filter((m) => m.key === role);
  } else if (isDevUser) {
    // Dev user sees all dashboards
    sidebarItems = allDashboards;
  } else {
    // Other users see their own dashboard only
    sidebarItems = allDashboards.filter((m) => m.key === role);
  }

  // inactivity logout
  useEffect(() => {
    const events = ["click", "keydown", "mousemove", "scroll"];
    const updateActivity = () =>
      localStorage.setItem("lastActivity", Date.now().toString());
    events.forEach((e) => window.addEventListener(e, updateActivity));
    const interval = setInterval(() => {
      const last = parseInt(localStorage.getItem("lastActivity") || "0", 10);
      if (Date.now() - last > 120 * 60 * 1000) router.push("/login");
    }, 60 * 1000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, updateActivity));
      clearInterval(interval);
    };
  }, [router]);

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1">
        <aside className="w-64 bg-gray-800 text-white p-4">
          <h2 className="text-xl font-bold mb-4">WeCare Dev Nav</h2>
          <nav className="space-y-2">
            {sidebarItems.map((item) => (
              <Link
                key={item.key}
                href={item.path}
                className="block p-2 hover:bg-gray-700 rounded"
              >
                {item.title}
              </Link>
            ))}
          </nav>
          <button
            onClick={() => {
              localStorage.removeItem("accessToken");
              document.cookie =
                "refreshToken=; path=/; secure; SameSite=Lax; max-age=0";
              router.push("/login");
            }}
            className="block mt-4 hover:underline"
          >
            ออกจากระบบ
          </button>
        </aside>
        <main className="flex-1 overflow-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}