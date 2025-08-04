"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AddPatientModal } from '@/components/community/AddPatientModal';

type Patient = {
  id: string;
  prefix: string;
  firstName: string;
  lastName: string;
};

export default function PatientsList() {
  const { token, loading: authLoading } = useAuth();
  const [patients, setPatients] = useState<Patient[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const pageSize = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  // Handle auth states
  if (authLoading) {
    return <p role="status">Loading authentication...</p>;
  }
  if (!token) {
    return <p role="alert">Unauthorized</p>;
  }
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/patients?search=${encodeURIComponent(debouncedSearchTerm)}&page=${page}&limit=${pageSize}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        })
      .then(res => res.ok ? res.json() : Promise.reject(new Error('Failed to fetch')))
      .then((data: { patients: Patient[]; total: number }) => {
        setPatients(data.patients);
        const pages = Math.max(1, Math.ceil(data.total / pageSize));
        setPageCount(pages);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [debouncedSearchTerm, page, refreshTrigger, token]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const handleSuccess = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);



  const totalPages = pageCount;
  const current = patients;

  return (
    <>
      {/* Header & Add Button */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">จัดการผู้ป่วย</h1>
        <button onClick={openModal} className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded">+ เพิ่มผู้ป่วย</button>
      </div>
      <AddPatientModal isOpen={isModalOpen} onClose={closeModal} onSuccess={handleSuccess} />

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <p role="status">Loading...</p>
        ) : error ? (
          <p role="alert" aria-label={`Error: ${error}`}>Error: {error}</p>
        ) : (
          <>
            <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <input className="w-full p-2 border rounded"
                type="text"
                placeholder="ค้นหาชื่อผู้ป่วย"
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
              />
              <ul>
                {patients?.map(p => (
                  <li key={p.id}>{p.prefix} {p.firstName} {p.lastName}</li>
                ))}
              </ul>
            </div>
            <div className="mt-4 flex justify-center items-center space-x-4">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Prev</button>
              <span>{page} / {pageCount}</span>
              <button disabled={page >= pageCount} onClick={() => setPage(page + 1)} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Next</button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

