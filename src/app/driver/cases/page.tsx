'use client';

import React, { useState, useEffect } from 'react';
import { TruckIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
// import { useDriverCases } from '@/hooks/useDriverCases'; // TODO: เมื่อ Hook จริงพร้อมใช้งาน ให้ uncomment บรรทัดนี้

// Hook เพื่อรอให้ client mount ก่อนใช้งาน Date
const useHasMounted = () => {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  return hasMounted;
};

// --- Mock Data & Hook สำหรับการแสดงผลเบื้องต้น ---
const mockCases = [
  {
    id: 'ride-001',
    status: 'PENDING',
    patient: { name: 'คุณสมชาย ใจดี', location: '123 ถ.สุขุมวิท, คลองเตย' },
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: 'ride-002',
    status: 'ACCEPTED',
    driverId: 'dev-user-id',
    patient: { name: 'คุณสมหญิง มีสุข', location: '456 ถ.รัชดา, ห้วยขวาง' },
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'ride-003',
    status: 'IN_PROGRESS',
    driverId: 'dev-user-id',
    patient: { name: 'คุณมานะ อดทน', location: '789 ถ.พหลโยธิน, จตุจักร' },
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
];

const useDriverCases = () => {
  const [cases, setCases] = useState(mockCases);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const acceptCase = async (rideId: string) => {
    setCases(prev => prev.map(c => c.id === rideId ? { ...c, status: 'ACCEPTED', driverId: 'dev-user-id' } : c));
  };

  const completeCase = async (rideId: string) => {
    setCases(prev => prev.filter(c => c.id !== rideId));
  };

  return { cases, isLoading, error, acceptCase, completeCase };
};
// --- จบส่วน Mock ---

const StatusBadge = ({ status }: { status: string }) => {
  const statusInfo: Record<string, { text: string; color: string; icon: React.ElementType }> = {
    PENDING: { text: 'รอคนขับ', color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
    ACCEPTED: { text: 'รับงานแล้ว', color: 'bg-blue-100 text-blue-800', icon: TruckIcon },
    IN_PROGRESS: { text: 'กำลังเดินทาง', color: 'bg-green-100 text-green-800', icon: TruckIcon },
    COMPLETED: { text: 'เสร็จสิ้น', color: 'bg-gray-100 text-gray-800', icon: CheckCircleIcon },
  };
  const info = statusInfo[status] || statusInfo.COMPLETED;
  return (
    <span className={`inline-flex items-center gap-x-1.5 rounded-full px-2 py-1 text-xs font-medium ${info.color}`}>
      <info.icon className="h-4 w-4" />
      {info.text}
    </span>
  );
};

const CaseCard = ({ ride, onAccept, onComplete }: { ride: any; onAccept: (id: string) => void; onComplete: (id: string) => void }) => {
  const hasMounted = useHasMounted();
  const [processing, setProcessing] = useState(false);

  const handleAction = async (type: 'accept' | 'complete') => {
    setProcessing(true);
    if (type === 'accept') await onAccept(ride.id);
    else await onComplete(ride.id);
    setProcessing(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4 border border-gray-200 hover:shadow-lg transition">
      <div className="flex justify-between">
        <div>
          <h3 className="font-bold text-lg text-gray-800">{ride.patient.name}</h3>
          <p className="text-sm text-gray-600">{ride.patient.location}</p>
          {hasMounted && (
            <p className="text-xs text-gray-400 mt-1">เวลาแจ้ง: {new Date(ride.createdAt).toLocaleTimeString()}</p>
          )}
        </div>
        <StatusBadge status={ride.status} />
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 flex space-x-2">
        {ride.status === 'PENDING' && (
          <button onClick={() => handleAction('accept')} disabled={processing} className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-300">
            {processing ? 'กำลังรับ...' : 'รับงาน'}
          </button>
        )}
        {ride.status === 'IN_PROGRESS' && (
          <button onClick={() => handleAction('complete')} disabled={processing} className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-green-300">
            {processing ? 'กำลังจบ...' : 'จบงาน'}
          </button>
        )}
      </div>
    </div>
  );
};

export default function DriverCasesPage() {
  const { cases, isLoading, error, acceptCase, completeCase } = useDriverCases();

  if (isLoading) return <div className="p-4 text-center">กำลังโหลด...</div>;
  if (error) return <div className="p-4 text-center text-red-500">ผิดพลาด: {error.message}</div>;

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">รายการเคสล่าสุด</h1>
      {cases.length > 0 ? (
        cases.map(r => <CaseCard key={r.id} ride={r} onAccept={acceptCase} onComplete={completeCase} />)
      ) : (
        <div className="text-center py-10">
          <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-500">ยังไม่มีเคสในขณะนี้</p>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
// import { useDriverCases } from '@/hooks/useDriverCases'; // TODO: เมื่อ Hook จริงพร้อมใช้งาน ให้ uncomment บรรทัดนี้

// --- Mock Data & Hook สำหรับการแสดงผลเบื้องต้น ---
// หมายเหตุ: เมื่อ Hook จริงพร้อมใช้งาน ให้ลบส่วนนี้ออก
const mockCases = [
  {
    id: 'ride-001',
    status: 'PENDING',
    patient: { name: 'คุณสมชาย ใจดี', location: '123 ถ.สุขุมวิท, คลองเตย' },
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 นาทีที่แล้ว
  },
  {
    id: 'ride-002',
    status: 'ACCEPTED',
    driverId: 'dev-user-id', // สมมติว่าเคสนี้เป็นของคุณ
    patient: { name: 'คุณสมหญิง มีสุข', location: '456 ถ.รัชดา, ห้วยขวาง' },
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 นาทีที่แล้ว
  },
  {
    id: 'ride-003',
    status: 'IN_PROGRESS',
    driverId: 'dev-user-id', // สมมติว่าเคสนี้เป็นของคุณ
    patient: { name: 'คุณมานะ อดทน', location: '789 ถ.พหลโยธิน, จตุจักร' },
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 ชั่วโมงที่แล้ว
  },
];

const useDriverCases = () => {
  const [cases, setCases] = useState(mockCases);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const acceptCase = async (rideId: string) => {
    console.log(`Accepting case: ${rideId}`);
    setCases(prev => prev.map(c => c.id === rideId ? { ...c, status: 'ACCEPTED', driverId: 'dev-user-id' } : c));
  };

  const completeCase = async (rideId: string) => {
    console.log(`Completing case: ${rideId}`);
    setCases(prev => prev.filter(c => c.id !== rideId));
  };
  
  return { cases, isLoading, error, acceptCase, completeCase };
};
// --- จบส่วน Mock ---


// Component สำหรับแสดงสถานะของเคส
const StatusBadge = ({ status }: { status: string }) => {
  const statusInfo: Record<string, { text: string; color: string; icon: React.ElementType }> = {
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

// Component สำหรับแสดง Card ของแต่ละเคส
const CaseCard = ({ ride, onAccept, onComplete }: { ride: any; onAccept: (id: string) => void; onComplete: (id: string) => void }) => {
  const hasMounted = useHasMounted();
  const [isAccepting, setIsAccepting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const handleAccept = async () => {
    setIsAccepting(true);
    await onAccept(ride.id);
    setIsAccepting(false);
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    await onComplete(ride.id);
    setIsCompleting(false);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 border border-gray-200 transition-all hover:shadow-lg">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg text-gray-800">{ride.patient.name}</h3>
          <p className="text-sm text-gray-600">{ride.patient.location}</p>
          {hasMounted && (
            <p className="text-xs text-gray-400 mt-1">เวลาแจ้ง: {new Date(ride.createdAt).toLocaleTimeString()}</p>
          )}
        </div>
        <StatusBadge status={ride.status} />
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 flex space-x-2">
        {ride.status === 'PENDING' && (
          <button onClick={handleAccept} disabled={isAccepting} className="w-full bg-blue-500 text-white py-2 rounded disabled:bg-blue-300">{isAccepting?'กำลังรับงาน...':'รับงาน'}</button>
        )}
        {ride.status === 'IN_PROGRESS' && (
          <button onClick={handleComplete} disabled={isCompleting} className="w-full bg-green-500 text-white py-2 rounded disabled:bg-green-300">{isCompleting?'กำลังจบงาน...':'จบงาน'}</button>
        )}
      </div>
    </div>
  );
};

export default function DriverCasesPage() {
  const { cases, isLoading, error, acceptCase, completeCase } = useDriverCases();

  if (isLoading) {
    return <div className="p-4 text-center">กำลังโหลดข้อมูลเคส...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">เกิดข้อผิดพลาดในการโหลดข้อมูล: {error.message}</div>;
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
}

import React, { useState, useEffect } from 'react';

// 1. แก้ไข: สร้าง useHasMounted hook ขึ้นมาในไฟล์นี้โดยตรงเพื่อแก้ปัญหาการ Resolve Path
const useHasMounted = () => {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  return hasMounted;
};

// --- Mock Data & Hook สำหรับการแสดงผลเบื้องต้น ---
const mockCases = [
  { id: 'ride-001', status: 'PENDING', patient: { name: 'คุณสมชาย ใจดี', location: '123 ถ.สุขุมวิท, คลองเตย' }, createdAt: new Date().toISOString() },
  { id: 'ride-002', status: 'ACCEPTED', patient: { name: 'คุณสมหญิง มีสุข', location: '456 ถ.รัชดา, ห้วยขวาง' }, createdAt: new Date().toISOString() },
  { id: 'ride-003', status: 'IN_PROGRESS', patient: { name: 'คุณมานะ อดทน', location: '789 ถ.พหลโยธิน, จตุจักร' }, createdAt: new Date().toISOString() },
];
const useDriverCases = () => ({ cases: mockCases, isLoading: false, error: null, acceptCase: async (id: string) => console.log('accept', id), completeCase: async (id: string) => console.log('complete', id) });
// --- จบส่วน Mock ---

const StatusBadge = ({ status }: { status: string }) => {
  const statusStyles: { [key: string]: string } = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    ACCEPTED: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-green-100 text-green-800',
  };
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

const CaseCard = ({ ride, onAccept, onComplete }: { ride: any, onAccept: (id: string) => void, onComplete: (id: string) => void }) => {
  const hasMounted = useHasMounted(); // 2. เรียกใช้ hook ใน component ที่แสดงผลเวลา
  const [isAccepting, setIsAccepting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const handleAccept = async () => {
    setIsAccepting(true);
    await onAccept(ride.id);
    setIsAccepting(false);
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    await onComplete(ride.id);
    setIsCompleting(false);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 border border-gray-200 transition-all hover:shadow-lg">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg text-gray-800">{ride.patient.name}</h3>
          <p className="text-sm text-gray-600">{ride.patient.location}</p>
          {/* 3. แสดงผลเวลาก็ต่อเมื่อ hasMounted เป็น true เท่านั้น */}
          {hasMounted && (
            <p className="text-xs text-gray-400 mt-1">
              เวลาแจ้ง: {new Date(ride.createdAt).toLocaleTimeString()}
            </p>
          )}
        </div>
        <StatusBadge status={ride.status} />
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 flex space-x-2">
        {ride.status === 'PENDING' && (
          <button onClick={handleAccept} disabled={isAccepting} className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors">
            {isAccepting ? 'กำลังรับงาน...' : 'รับงาน'}
          </button>
        )}
        {ride.status === 'IN_PROGRESS' && (
          <button onClick={handleComplete} disabled={isCompleting} className="w-full bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 disabled:bg-green-300 transition-colors">
            {isCompleting ? 'กำลังจบงาน...' : 'จบงาน'}
          </button>
        )}
      </div>
    </div>
  );
};

export default function DriverCasesPage() {
  const { cases, isLoading, error, acceptCase, completeCase } = useDriverCases();

  if (isLoading) {
    return <div className="p-4">กำลังโหลดข้อมูลเคส...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">เกิดข้อผิดพลาด: {error.message}</div>;
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">รายการเคสสำหรับคุณ</h1>
      {cases && cases.length > 0 ? (
        <div>
          {cases.map((ride) => (
            <CaseCard key={ride.id} ride={ride} onAccept={acceptCase} onComplete={completeCase} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">ยังไม่มีเคสในขณะนี้</p>
        </div>
      )}
    </div>
  );
}
