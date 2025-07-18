'use client';

import { PlusIcon, ClockIcon, CheckCircleIcon, XCircleIcon, InboxIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import React, { useState, useMemo } from 'react';
import { RequestFormModal } from '@/components/community/RequestFormModal';
import { AddPatientModal } from '@/components/community/AddPatientModal';
import { useCommunityRequests } from '@/hooks/useCommunityRequests';
import { usePatients } from '@/hooks/usePatients';


const StatusBadge = ({ status }: { status: string }) => {
    let colorClasses = 'bg-gray-100 text-gray-800';
    if (status === 'PENDING') colorClasses = 'bg-yellow-100 text-yellow-800';
    if (status === 'APPROVED') colorClasses = 'bg-blue-100 text-blue-800';
    if (status === 'COMPLETED') colorClasses = 'bg-green-100 text-green-800';
    return <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${colorClasses}`}>{status}</span>;
};

export default function CommunityDashboardPage() {
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
  
  const [selectedPatientId, setSelectedPatientId] = useState<string>('all');

  const { patients, isLoading: patientsLoading, mutate: mutatePatients } = usePatients();
  const { requests, isLoading: requestsLoading, isError, mutate: mutateRequests } = useCommunityRequests();

  const filteredRequests = useMemo(() => {
    if (selectedPatientId === 'all') {
      return requests;
    }
    return requests.filter((req: any) => req.patientId === selectedPatientId);
  }, [requests, selectedPatientId]);

  // Map of patientId to patient full name
  const patientMap = useMemo(() => Object.fromEntries(
    patients.map((p: any) => [p.id, `${p.firstName} ${p.lastName}`])
  ), [patients]);
  // Map of patientId to gender
  const patientGenderMap = useMemo(() => Object.fromEntries(
    patients.map((p: any) => [p.id, p.gender])
  ), [patients]);


  const summaryStats = useMemo(() => [
    { name: 'กำลังรออนุมัติ', value: requests.filter((r: any) => r.status === 'PENDING').length, icon: ClockIcon },
    { name: 'อนุมัติแล้ว', value: requests.filter((r: any) => r.status === 'APPROVED').length, icon: CheckCircleIcon },
    { name: 'ปฏิเสธ', value: requests.filter((r: any) => r.status === 'REJECTED').length, icon: XCircleIcon },
  ], [requests]);

  const handleAddPatientSuccess = () => {
    mutatePatients();
    setIsAddPatientModalOpen(false);
  };

  const handleCreateRequestSuccess = () => {
    mutateRequests();
    setIsRequestModalOpen(false);
  };
  
  const renderContent = () => {
    if (requestsLoading) {
      return <div className="text-center py-10"><p>กำลังโหลดข้อมูลคำขอ...</p></div>;
    }
    if (isError) {
      return <div className="text-center py-10 text-red-500"><p>เกิดข้อผิดพลาดในการโหลดข้อมูล</p></div>;
    }
    if (filteredRequests.length === 0) {
      return (
        <div className="text-center py-16 px-4 rounded-lg border-2 border-dashed border-gray-300 mt-8">
          <InboxIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">ยังไม่มีคำขอรับบริการ</h3>
          <p className="mt-1 text-sm text-gray-500">เริ่มต้นสร้างคำขอรับบริการครั้งแรกของคุณได้เลย</p>
        </div>
      );
    }

    return (
      <div className="mt-4 overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">หัวข้อ</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">ประเภท</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">สถานะ</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">ผู้ป่วย</th>
<th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">เพศ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredRequests.map((request: any) => (
              <tr key={request.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{request.title}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{request.type}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500"><StatusBadge status={request.status} /></td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{patientMap[request.patientId] || '-'}</td>
<td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{patientGenderMap[request.patientId] || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      <div className="space-y-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">ภาพรวมของคุณ</h1>
          <div className="mt-4 sm:mt-0 sm:ml-4 flex items-center gap-x-2">
            <button
              type="button"
              onClick={() => setIsAddPatientModalOpen(true)}
              className="inline-flex items-center gap-x-2 rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              <UserPlusIcon className="-ml-0.5 h-5 w-5" />
              เพิ่มผู้ป่วยในความดูแล
            </button>
            <button
              type="button"
              onClick={() => setIsRequestModalOpen(true)}
              className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              <PlusIcon className="-ml-0.5 h-5 w-5" />
              สร้างคำขอใหม่
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {summaryStats.map((item) => (
            <div key={item.name} className="overflow-hidden rounded-lg bg-white shadow p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <item.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">{item.name}</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{item.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="sm:flex sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-gray-900">รายการคำขอล่าสุด</h2>
            {patients.length > 0 && (
              <div className="mt-4 sm:mt-0">
                <label htmlFor="patient-selector" className="sr-only">เลือกผู้ป่วย</label>
                <select
                  id="patient-selector"
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm"
                >
                  <option value="all">ดูทั้งหมด</option>
                  {patients.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          {renderContent()}
        </div>
      </div>
      
      <RequestFormModal 
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSuccess={handleCreateRequestSuccess}
      />
      <AddPatientModal 
        isOpen={isAddPatientModalOpen}
        onClose={() => setIsAddPatientModalOpen(false)}
        onSuccess={handleAddPatientSuccess}
      />
    </>
  );
}
