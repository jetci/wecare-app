"use client";
import React from 'react';

export default function CommunityDashboardWireframe() {
  return (
    <div className="p-6">
      {/* Header */}
      <h1 className="text-2xl font-bold mb-4">Dashboard: Community (ประชาชน)</h1>

      {/* Sub-nav */}
      <nav className="mb-6">
        <ul className="flex space-x-4">
          <li className="text-blue-600">ขอความช่วยเหลือ</li>
          <li className="text-gray-600">ประวัติการแจ้ง</li>
          <li className="text-gray-600">แผนที่</li>
          <li className="text-gray-600">โปรไฟล์</li>
        </ul>
      </nav>

      {/* Grid layout */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Column 1: Map + Help Button */}
        <section className="bg-gray-100 p-4 rounded shadow">
          <div className="h-48 bg-gray-300 mb-4" role="img" aria-label="Map Placeholder"></div>
          <button className="w-full bg-green-500 text-white py-2 rounded">ขอความช่วยเหลือ</button>
        </section>

        {/* Column 2: Profile + Status Cards */}
        <div className="space-y-6">
          <section className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">โปรไฟล์</h2>
            <p>ชื่อ: -</p>
            <p>รหัสบัตร: -</p>
            <p>โทร: -</p>
          </section>
          <section className="grid grid-cols-3 gap-4">
            <div className="bg-yellow-100 p-4 rounded shadow text-center">
              <p className="text-sm">รอดำเนินการ</p>
              <p className="text-2xl font-bold">--</p>
            </div>
            <div className="bg-blue-100 p-4 rounded shadow text-center">
              <p className="text-sm">กำลังดำเนินการ</p>
              <p className="text-2xl font-bold">--</p>
            </div>
            <div className="bg-green-100 p-4 rounded shadow text-center">
              <p className="text-sm">เสร็จสิ้น</p>
              <p className="text-2xl font-bold">--</p>
            </div>
          </section>
        </div>

        {/* Column 3: Notifications */}
        <section className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">แจ้งเตือนล่าสุด</h3>
          <ul className="space-y-2">
            <li className="h-6 bg-gray-200 animate-pulse"></li>
            <li className="h-6 bg-gray-200 animate-pulse"></li>
            <li className="h-6 bg-gray-200 animate-pulse"></li>
          </ul>
          <div className="mt-2 text-right">
            <span className="text-blue-600 hover:underline cursor-pointer">ดูทั้งหมด</span>
          </div>
        </section>

        {/* Full-width: Patients + Ride History */}
        <section className="md:col-span-2 bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">ข้อมูลผู้ป่วยในความดูแล</h2>
          <div className="h-24 bg-gray-100 animate-pulse"></div>
        </section>
        <section className="md:col-span-3 bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">ประวัติการจอง</h3>
          <div className="h-48 bg-gray-100 animate-pulse"></div>
        </section>
      </div>
    </div>
  );
}
