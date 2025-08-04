'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { useDriverCases, RideCase } from '@/hooks/useDriverCases'; // Import RideCase
import { NotificationList, Notification } from '../ui/NotificationList';
import { ConfirmationModal } from '../ui/ConfirmationModal';
import { DriverLiveMap } from '../maps/DriverLiveMap';
import { UnknownObject } from '@/types/components'; // Remove RideRequest

const fetcher = (url: string) => fetch(url).then(res => res.json());

export const DriverDashboard: React.FC = () => {
  const { cases, isLoading, isError, acceptCase, completeCase } = useDriverCases();
  const [isOnline, setIsOnline] = useState(false);
  const [actionRide, setActionRide] = useState<{ id: string; action: string } | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const pending = isOnline ? cases.filter((c: RideCase) => c.status === 'pending') : [];
  const inProgress = isOnline ? cases.filter((c: RideCase) => c.status === 'in_progress') : [];
  const history = cases.filter((c: RideCase) => c.status === 'completed');

  const { data: notifications } = useSWR<Notification[]>('/api/notifications', fetcher);

  const toggleOnline = () => setIsOnline(o => !o);

  const onAccept = async (id: string) => { await acceptCase(id); };
  const onComplete = async (id: string) => { await completeCase(id); };

  return (
    <div className="p-4 space-y-6">
      <button
        onClick={toggleOnline}
        className={`px-4 py-2 rounded ${isOnline ? 'bg-red-500' : 'bg-green-500'} text-white`}
      >
        {isOnline ? 'Go Offline' : 'Go Online'}
      </button>

      {isOnline && (
        <section>
          <h2 className="text-xl font-semibold">New Requests</h2>
          {isLoading && <p>Loading requests...</p>}
          {!isLoading && pending.length === 0 && <p>ไม่มีคำขอใหม่</p>}
          {pending?.map((r: RideCase) => (
            <div key={r.id} className="border p-2 my-2 flex justify-between items-center">
              <div>
                <p>Patient: {r.patient.firstName} {r.patient.lastName}</p>
                <p>Date: {isClient ? new Date(r.createdAt).toLocaleString() : new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="space-x-2">
                <button
                  className="px-2 py-1 bg-blue-500 text-white rounded"
                  onClick={() => onAccept(r.id)}
                >รับ</button>
                <button
                  className="px-2 py-1 bg-gray-400 text-white rounded"
                >ปฏิเสธ</button>
              </div>
            </div>
          ))}
        </section>
      )}

      {inProgress && inProgress.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold">Current Ride</h2>
          {inProgress.map((r: RideCase) => (
            <div key={r.id} className="space-y-4">
              <DriverLiveMap rideId={r.id} />
              <div className="flex space-x-2">
                <button
                  className="px-4 py-2 bg-yellow-500 text-white rounded"
                >มาถึงแล้ว</button>
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded"
                  onClick={() => onComplete(r.id)}
                >เสร็จสิ้น</button>
              </div>
            </div>
          ))}
        </section>
      )}

      <section>
        <h2 className="text-xl font-semibold">History</h2>
        {history?.length === 0 && <p>ยังไม่มีประวัติ</p>}
        <ul>
          {history?.map((r: RideCase) => (
            <li key={r.id} className="border-b py-2">
              {isClient ? new Date(r.createdAt).toLocaleString() : new Date(r.createdAt).toLocaleDateString()} - {r.patient.firstName} {r.patient.lastName}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Notifications</h2>
        {!notifications ? <p>Loading…</p> : <NotificationList items={notifications} />}
      </section>
    </div>
  )
}

export default DriverDashboard
