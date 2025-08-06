"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePatients } from '@/hooks/usePatients';
import PatientModal from '@/components/community/PatientModal';
import { Patient } from '@prisma/client';

// A simple confirmation modal component
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <h2 className="text-lg font-bold mb-4">{title}</h2>
        <p className="mb-6">{children}</p>
        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-md">ยกเลิก</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md">ยืนยัน</button>
        </div>
      </div>
    </div>
  );
};

export default function PatientsList() {
  const { token, loading: authLoading } = useAuth();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const [isPatientModalOpen, setPatientModalOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [isConfirmOpen, setConfirmOpen] = useState(false);

  // Debounce search term to avoid excessive API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { patients, meta, isLoading, isError, mutate } = usePatients({
    page,
    limit: 10,
    search: debouncedSearchTerm,
  });

  const handleSuccess = useCallback(() => {
    mutate(); // Re-fetch data after add/edit
    setPatientModalOpen(false);
  }, [mutate]);

  const handleOpenEditModal = (patient: Patient) => {
    setPatientToEdit(patient);
    setPatientModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setPatientToEdit(null);
    setPatientModalOpen(true);
  };

  const handleCloseModal = () => {
    setPatientModalOpen(false);
    setPatientToEdit(null);
  };

  const handleDeleteClick = (patient: Patient) => {
    setPatientToDelete(patient);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!patientToDelete || !token) return;

    try {
      const res = await fetch(`/api/patients/${patientToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete patient');
      }

      // Deletion successful, re-fetch data
      mutate();
      alert('ลบผู้ป่วยสำเร็จ');
    } catch (error) {
      console.error(error);
      alert(`เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
      setConfirmOpen(false);
      setPatientToDelete(null);
    }
  };

  if (authLoading) return <p className="text-center p-4">Loading authentication...</p>;
  if (!token) return <p className="text-center p-4 text-red-500">Unauthorized. Please log in.</p>;

  const renderContent = () => {
    if (isLoading) return <p className="text-center p-4">กำลังโหลดข้อมูลผู้ป่วย...</p>;
    if (isError) return <p className="text-center p-4 text-red-500">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>;
    if (patients.length === 0) return <p className="text-center p-4">ไม่พบข้อมูลผู้ป่วย</p>;

    return (
      <ul className="space-y-3">
        {patients.map((p: Patient) => (
          <li key={p.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
            <span>{p.prefix} {p.firstName} {p.lastName}</span>
            <div className="space-x-2">
              <button onClick={() => handleOpenEditModal(p)} className="text-blue-600 hover:underline">แก้ไข</button>
              <button onClick={() => handleDeleteClick(p)} className="text-red-600 hover:underline">ลบ</button>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold">จัดการผู้ป่วย</h1>
        <button onClick={handleOpenAddModal} className="w-full md:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">+ เพิ่มผู้ป่วย</button>
      </div>

      <PatientModal 
        isOpen={isPatientModalOpen} 
        onClose={handleCloseModal} 
        onSuccess={handleSuccess}
        patientToEdit={patientToEdit}
      />
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="ยืนยันการลบ"
      >
        คุณแน่ใจหรือไม่ว่าต้องการลบผู้ป่วย '{patientToDelete?.firstName} {patientToDelete?.lastName}'?
      </ConfirmationModal>

      <div className="mb-4">
        <input
          className="w-full p-2 border rounded-md"
          type="text"
          placeholder="ค้นหาจากชื่อ, นามสกุล, หรือเลขบัตรประชาชน..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        {renderContent()}
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="mt-6 flex justify-center items-center space-x-4">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50">ก่อนหน้า</button>
          <span>หน้า {meta.page} / {meta.totalPages}</span>
          <button disabled={page >= meta.totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50">ถัดไป</button>
        </div>
      )}
    </div>
  );
}
