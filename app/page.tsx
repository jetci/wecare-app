"use client";
import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return <p>กำลังเปลี่ยนหน้าไปยังล็อกอิน...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-8 bg-white rounded shadow">
        <h2 className="text-2xl font-bold">ยินดีต้อนรับ, {user?.name || user?.citizenId}</h2>
      </div>
    </div>
  );
}
