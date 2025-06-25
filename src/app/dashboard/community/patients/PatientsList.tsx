"use client";
import React, { useState, useEffect } from 'react';

type Patient = {
  id: string;
  prefix: string;
  firstName: string;
  lastName: string;
};

export default function PatientsList() {
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

  useEffect(() => {
    setLoading(true);
    fetch(`/api/patients?search=${encodeURIComponent(debouncedSearchTerm)}&page=${page}&limit=${pageSize}`)
      .then(res => res.ok ? res.json() : Promise.reject(new Error('Failed to fetch')))
      .then((data: { patients: Patient[]; total: number }) => {
        setPatients(data.patients);
        const pages = Math.max(1, Math.ceil(data.total / pageSize));
        setPageCount(pages);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [debouncedSearchTerm, page]);

  if (loading) {
    return <p role="status">Loading...</p>;
  }
  if (error) {
    return <p role="alert" aria-label={`Error: ${error}`}>Error: {error}</p>;
  }
  if (!patients || patients.length === 0) {
    return <p role="alert" aria-label="ไม่มีข้อมูลผู้ป่วย">ไม่มีข้อมูลผู้ป่วย</p>;
  }

  const totalPages = pageCount;
  const current = patients;

  return (
    <div className="p-4 space-y-4 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <input className="w-full p-2 border rounded"
        type="text"
        placeholder="ค้นหาชื่อผู้ป่วย"
        value={searchTerm}
        onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
      />
      <ul>
        {current.map(p => (
          <li key={p.id}>{p.prefix} {p.firstName} {p.lastName}</li>
        ))}
      </ul>
      <div>
        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
        <span>{page} / {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
}
