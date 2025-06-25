"use client";
import Link from "next/link";
import React from "react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ใช้ Header จาก RootLayout แทน ไม่ต้องซ้ำในหน้านี้ */}
      <main className="flex-grow container mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl font-bold mb-4">ยินดีต้อนรับสู่ WeCare Dashboard</h2>
        <p className="text-lg text-gray-600 mb-8">ระบบจัดการบริการขนส่งและดูแลผู้ป่วย</p>
        <div className="space-x-4 flex justify-center">
          <Link href="/register" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">สมัครสมาชิก</Link>
          <Link href="/login" className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">เข้าสู่ระบบ</Link>
        </div>
      </main>
      <footer className="bg-white border-t py-4">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          2025 WeCare. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
