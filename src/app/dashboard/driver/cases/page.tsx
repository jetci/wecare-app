'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { TruckIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useDriverCases } from '@/hooks/useDriverCases';

// Hook to avoid hydration mismatch
const useHasMounted = () => {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);
  return hasMounted;
};

const StatusBadge = ({ status }: { status: string }) => {
  const mapping: Record<string, { text: string; color: string; icon: React.ElementType }> = {
    PENDING: { text: 'รอคนขับ', color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
    ACCEPTED: { text: 'รับงานแล้ว', color: 'bg-blue-100 text-blue-800', icon: TruckIcon },
    IN_PROGRESS: { text: 'กำลังเดินทาง', color: 'bg-green-100 text-green-800', icon: TruckIcon },
    COMPLETED: { text: 'เสร็จสิ้น', color: 'bg-gray-100 text-gray-800', icon: CheckCircleIcon },
  };
  const info = mapping[status] || mapping.COMPLETED;
  const Icon = info.icon;
  return (
    <span className={`inline-flex items-center gap-x-1.5 rounded-full px-2 py-1 text-xs font-medium ${info.color}`}>
      <Icon className="h-4 w-4" />
      {info.text}
    </span>
  );
};

type Ride = {
  id: string;
  status: string;
  createdAt: string;
  patient: { name: string; location: string };
};

const CaseCard = ({
  ride,
  onAccept,
  onComplete,
}: {
  ride: Ride;
  onAccept: (id: string) => Promise<void>;
  onComplete: (id: string) => Promise<void>;
}) => {
  const [processing, setProcessing] = useState(false);
  const mounted = useHasMounted();

  const handle = async (action: 'accept' | 'complete') => {
    setProcessing(true);
    try {
      if (action === 'accept') await onAccept(ride.id);
      else await onComplete(ride.id);
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4 border">
      <div className="flex justify-between">
        <div>
          <h3 className="font-bold text-lg text-gray-800">{ride.patient.name}</h3>
          <p className="text-sm text-gray-600">{ride.patient.location}</p>
          {mounted && (
            <p className="text-xs text-gray-400">
              เวลาแจ้ง: {new Date(ride.createdAt).toLocaleTimeString('th-TH')}
            </p>
          )}
        </div>
        <StatusBadge status={ride.status} />
      </div>
      <div className="mt-4">
        {ride.status === 'PENDING' && (
          <button
            onClick={() => handle('accept')}
            disabled={processing}
            className="w-full bg-blue-600 text-white py-2 rounded flex justify-center items-center"
          >
            {processing ? 'กำลังรับ...' : 'รับงานนี้'}
          </button>
        )}
        {ride.status === 'IN_PROGRESS' && (
          <button
            onClick={() => handle('complete')}
            disabled={processing}
            className="w-full bg-green-600 text-white py-2 rounded flex justify-center items-center"
          >
            {processing ? 'กำลังจบงาน...' : 'จบงาน'}
          </button>
        )}
      </div>
    </div>
  );
};

const DriverCasesPage = () => {
  const { loading: authLoading, isAuthenticated, role } = useAuth();
  const router = useRouter();
  const { cases, isLoading, isError, error, acceptCase, completeCase } = useDriverCases();

  // Redirect unauthenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?callbackUrl=${encodeURIComponent('/dashboard/driver/cases')}`);
    }
  }, [authLoading, isAuthenticated, router]);

  // Redirect on 403 Forbidden
  useEffect(() => {
    if (!isLoading && isError && (error as any)?.status === 403) {
      router.push(`/login?callbackUrl=${encodeURIComponent('/dashboard/driver/cases')}`);
    }
  }, [isLoading, isError, error, router]);

  if (authLoading) return <div className="p-4 text-center">กำลังตรวจสอบสิทธิ์...</div>;
  if (!isAuthenticated) return null;
  if (role !== 'DRIVER' && role !== 'DEVELOPER')
    return <div className="p-4 text-center text-red-500">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</div>;
  if (isLoading) return <div className="p-4 text-center">กำลังโหลดข้อมูลเคส...</div>;
  if (isError)
    return (
      <div className="p-4 text-center text-red-500">
        เกิดข้อผิดพลาดในการโหลดข้อมูล:
        <pre className="mt-2 text-left whitespace-pre-wrap">{JSON.stringify(error, null, 2)}</pre>
      </div>
    );

  return (
    <div className="p-4 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">เคสที่เข้ามาล่าสุด</h1>
      {cases.length > 0
        ? cases.map((ride) => (
            <CaseCard key={ride.id} ride={ride} onAccept={acceptCase} onComplete={completeCase} />
          ))
        : (
            <div className="text-center py-16 px-4 rounded-lg border-2 border-dashed border-gray-300">
              <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">ยังไม่มีเคสในขณะนี้</h3>
              <p className="mt-1 text-sm text-gray-500">เมื่อมีเคสใหม่เข้ามา ระบบจะแจ้งเตือนคุณที่นี่</p>
            </div>
          )}
    </div>
  );
};

export default DriverCasesPage;