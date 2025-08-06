'use client';

import { useAuth } from '@/context/AuthContext';


export default function DeveloperPage() {
  const { user, role, loading } = useAuth();


  if (loading || !user || role !== 'DEVELOPER') {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>กำลังตรวจสอบสิทธิ์การเข้าถึง...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">ต้อนรับ Developer</h1>
      <p className="mt-2">ระบบนี้อยู่ในระหว่างพัฒนา: Feature สำหรับ Developer จะมาในเร็วๆ นี้</p>
      <div className="mt-4 p-4 border rounded-lg bg-gray-50">
        <h2 className="text-lg font-semibold">เมนูสำหรับนักพัฒนา (เร็วๆ นี้)</h2>
        <ul className="list-disc list-inside mt-2">
          <li>เครื่องมือทดสอบ API Endpoints</li>
          <li>ระบบแสดงผล Log แบบ Real-time</li>
          <li>การจัดการ Feature Flags</li>
        </ul>
      </div>
    </div>
  );
}
