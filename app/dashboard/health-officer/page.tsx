"use client";

import React, { useState, useEffect } from "react";
import Modal from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { KpiCard } from '@/components/dashboard/KpiCard';
import MapOverview from '@/components/dashboard/MapOverview';
import Link from 'next/link';
import { Role } from '@/types/roles';
import RoleGuard from '@/components/RoleGuard';

function HealthOfficerDashboardContent() {
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [messageError, setMessageError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/patients')
      .then(res => res.json())
      .then(data => setPatients(data.patients ?? []))
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Spinner data-testid="spinner" />;
  }
  if (fetchError) {
    return <p data-testid="error-patients" className="text-red-500">โหลดข้อมูลผู้ป่วยล้มเหลว</p>;
  }
  if (patients.length === 0) {
    return <div data-testid="empty-state" className="p-4">ยังไม่มีผู้ป่วยในความดูแล</div>;
  }
  const list = patients;

  const handleSend = async () => {
    setMessageError('');
    if (!message.trim()) { setMessageError('กรุณาใส่ข้อความ'); return; }
    if (message.length > 500) { setMessageError('ข้อความยาวเกิน 500 ตัวอักษร'); return; }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Unknown error');
      setBroadcastOpen(false);
      setMessage('');
    } catch (err: any) {
      setMessageError(err.message || 'ส่งข้อความล้มเหลว');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div data-testid="healthofficer-dashboard" className="space-y-4">
      {/* Add patient menu */}
      <div className="flex justify-end">
        <Link href="/dashboard/community/patients/new" className="px-4 py-2 bg-green-600 text-white rounded">
          เพิ่มผู้ป่วยในความดูแล
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-4" data-testid="kpi-grid">
        <KpiCard testId="kpi-pending" title="รออนุมัติ" count={list.filter((p: any) => p.status==='PENDING').length} color="bg-yellow-500" />
        <KpiCard testId="kpi-in-care" title="ในความดูแล" count={list.filter((p: any) => p.status==='IN_CARE').length} color="bg-blue-500" />
        <KpiCard testId="kpi-transferred" title="ส่งต่อแล้ว" count={list.filter((p: any) => p.status==='TRANSFERRED').length} color="bg-green-500" />
      </div>
      <MapOverview data-testid="map-overview" locations={list.map(p => ({ id: p.id, lat: p.lat, lng: p.lng }))} />
      <div className="p-2 bg-gray-100">
        <button data-testid="broadcast-button" className="px-4 py-2 bg-red-500 text-white rounded" onClick={()=>setBroadcastOpen(true)}>
          ส่งประกาศ
        </button>
      </div>
      {broadcastOpen && (
        <Modal data-testid="broadcast-modal" open={broadcastOpen} onClose={()=>setBroadcastOpen(false)}>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Emergency Broadcast</h3>
            <textarea
              placeholder="ข้อความ"
              value={message}
              onChange={e=>setMessage(e.target.value)}
            />
            {messageError && <p className="text-red-500 text-sm mt-1">{messageError}</p>}
            <button data-testid="broadcast-send"
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
              onClick={handleSend}
              disabled={isSubmitting}
            >ส่ง</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function HealthOfficerDashboardPage() {
  return (
    <RoleGuard allowedRoles={[Role.HEALTH_OFFICER]}>
      <HealthOfficerDashboardContent />
    </RoleGuard>
  );
}
