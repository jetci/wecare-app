// app/dashboard/driver/cases/page.tsx
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
  const hasMounted = useHasMounted();

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
          {hasMounted && (
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
      {cases.length > 0 ? (
        cases.map((ride) => (
          <CaseCard key={ride.id} ride={ride} onAccept={acceptCase} onComplete={completeCase} />
        ))
      ) : (
        <div className="text-center py-16 px-4 rounded-lg border-2 border-dashed border-gray-300">
          <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">ยังไม่มีเคสในขณะนี้</h3>
          <p className="mt-1 text-sm text-gray-500">เมื่อมีเคสใหม่ในระบบ จะแจ้งเตือนในหน้านี้</p>
        </div>
      )}
    </div>
  );
};

export default DriverCasesPage;
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { TruckIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
// 1. นำเข้า Hook useDriverCases ตัวจริง
import { useDriverCases } from '@/hooks/useDriverCases'; 



const useHasMounted = () => {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => { setHasMounted(true); }, []);
  return hasMounted;
};

const StatusBadge = ({ status }: { status: string }) => {
  const statusInfo: { [key: string]: { text: string; color: string; icon: React.ElementType } } = {
    PENDING: { text: 'รอคนขับ', color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
    ACCEPTED: { text: 'รับงานแล้ว', color: 'bg-blue-100 text-blue-800', icon: TruckIcon },
    IN_PROGRESS: { text: 'กำลังเดินทาง', color: 'bg-green-100 text-green-800', icon: TruckIcon },
    COMPLETED: { text: 'เสร็จสิ้น', color: 'bg-gray-100 text-gray-800', icon: CheckCircleIcon },
  };
  const info = statusInfo[status] || statusInfo['COMPLETED'];
  return (
    <span className={`inline-flex items-center gap-x-1.5 rounded-full px-2 py-1 text-xs font-medium ${info.color}`}>
        <info.icon className="h-4 w-4" />
        {info.text}
    </span>
  );
};

const CaseCard = ({ ride, onAccept, onComplete }: { ride: any, onAccept: (id: string) => void, onComplete: (id: string) => void }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const hasMounted = useHasMounted();

  const handleAction = async (action: 'accept' | 'complete') => {
    setIsProcessing(true);
    try {
      if (action === 'accept') {
        await onAccept(ride.id);
      } else {
        await onComplete(ride.id);
      }
    } catch (error) {
      console.error("Action failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 border border-gray-200 transition-all hover:shadow-lg">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg text-gray-800">{ride.patient.name}</h3>
          <p className="text-sm text-gray-600">{ride.patient.location}</p>
           {hasMounted && (
            <p className="text-xs text-gray-400 mt-1">
              เวลาแจ้ง: {new Date(ride.createdAt).toLocaleTimeString('th-TH')}
            </p>
          )}
        </div>
        <StatusBadge status={ride.status} />
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        {ride.status === 'PENDING' && (
          <button
            onClick={() => handleAction('accept')}
            disabled={isProcessing}
            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังรับงาน...
              </>
            ) : 'รับงานนี้'}
          </button>
        )}
        {ride.status === 'IN_PROGRESS' && (
          <button
            onClick={() => handleAction('complete')}
            disabled={isProcessing}
            className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
             {isProcessing ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังจบงาน...
              </>
            ) : 'จบงาน'}
          </button>
        )}
      </div>
    </div>
  );
};

const DriverCasesPage = () => {
  const { loading: authLoading, isAuthenticated, role } = useAuth();
  const router = useRouter();

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?callbackUrl=${encodeURIComponent('/dashboard/driver/cases')}`);
    }
  }, [authLoading, isAuthenticated, router]);

  const { cases, isLoading, isError, error, acceptCase, completeCase } = useDriverCases();

  // Redirect on 403 Forbidden from API
  useEffect(() => {
    if (!isLoading && isError && (error as any)?.status === 403) {
      router.push(`/login?callbackUrl=${encodeURIComponent('/dashboard/driver/cases')}`);
    }
  }, [isLoading, isError, error, router]);

  if (authLoading) {
    return <div className="p-4 text-center">กำลังตรวจสอบสิทธิ์...</div>;
  }
  if (!isAuthenticated) {
    return null; // redirecting
  }
  if (role !== 'DRIVER' && role !== 'DEVELOPER') {
    return <div className="p-4 text-center text-red-500">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</div>;
  }
  if (isLoading) {
    return <div className="p-4 text-center">กำลังโหลดข้อมูลเคส...</div>;
  }
  if (isError) {
    console.error('useDriverCases error:', error);
    return (
      <div className="p-4 text-center text-red-500">
        เกิดข้อผิดพลาดในการโหลดข้อมูล:
        <pre className="mt-2 text-left whitespace-pre-wrap">
          {JSON.stringify(error, null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">เคสที่เข้ามาล่าสุด</h1>
      {cases && cases.length > 0 ? (
        <div>
          {cases.map((ride) => (
            <CaseCard key={ride.id} ride={ride} onAccept={acceptCase} onComplete={completeCase} />
          ))}
        </div>
      ) : (
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
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?callbackUrl=${encodeURIComponent('/dashboard/driver/cases')}`);
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) {

  }
  if (!isAuthenticated) {
    return null; // redirecting...
  }
  if (role !== 'DRIVER' && role !== 'DEVELOPER') {
    return <div className="p-4 text-center text-red-500">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</div>;
  }

  const { cases, isLoading, isError, error, acceptCase, completeCase } = useDriverCases();

  const { loading: authLoading, isAuthenticated, role } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?callbackUrl=${encodeURIComponent('/dashboard/driver/cases')}`);
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) {
  // Authentication loading
  return <div className="p-4 text-center">กำลังตรวจสอบสิทธิ์...</div>;
}

if (!isAuthenticated) {
  return <div className="p-4 text-center text-red-500">กรุณาเข้าสู่ระบบเพื่อเข้าถึงหน้านี้</div>;
}

// Role guard
if (role !== 'DRIVER' && role !== 'DEVELOPER') {
  return <div className="p-4 text-center text-red-500">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</div>;
}

  }

  if (!isAuthenticated) {
    return <div className="p-4 text-center text-red-500">กรุณาเข้าสู่ระบบเพื่อเข้าถึงหน้านี้</div>;
  }
  const { cases, isLoading, isError, error, acceptCase, completeCase } = useDriverCases();

  
  useEffect(() => {
    useEffect(() => {
    if (!isLoading && isError && (error as any).status === 403) {
      router.push(`/login?callbackUrl=${encodeURIComponent('/dashboard/driver/cases')}`);
    }
  }, [isLoading, isError, error, router]);
      router.push(`/login?callbackUrl=${encodeURIComponent('/dashboard/driver/cases')}`);
    }
  }, [isLoading, isError, error, router]);

  if (isLoading) {
    return <div className="p-4 text-center">กำลังโหลดข้อมูลเคส...</div>;
  }

  if (isError) {
    console.error('useDriverCases error:', error);
    return <div className="p-4 text-center text-red-500">เกิดข้อผิดพลาดในการโหลดข้อมูล: <pre className="mt-2 text-left whitespace-pre-wrap">{JSON.stringify(error, null, 2)}</pre></div>;
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">เคสที่เข้ามาล่าสุด</h1>
      
      {cases && cases.length > 0 ? (
        <div>
          {cases.map((ride) => (
            <CaseCard key={ride.id} ride={ride} onAccept={acceptCase} onComplete={completeCase} />
          ))}
        </div>
      ) : (
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
