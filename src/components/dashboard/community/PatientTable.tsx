'use client';

import React from 'react';

import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/apiFetch';
import { Table } from '@/components/ui/Table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Skeleton } from '@/components/ui/Skeleton';
import { Terminal } from 'lucide-react';
import SearchInput from '@/components/ui/SearchInput';
import { Button } from '@/components/ui/Button';

// Assuming a Patient data structure from the API
export interface Patient {
  id: string;
  name: string;
  age: number;
  condition: string;
  status: 'Stable' | 'Critical' | 'Pending';
  lastCheckIn: string;
}

const LoadingSkeleton = () => (
  <div className="space-y-2">
    {[...Array(5)].map((_, i) => (
      <Skeleton key={i} className="h-12 w-full" />
    ))}
  </div>
);

interface PatientTableProps {
  onRowClick: (patientId: string) => void;
}

const PatientTable = ({ onRowClick }: PatientTableProps) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);


  const fetchPatients = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm,
      });
      const response = await apiFetch(`/api/patients?${params.toString()}`);
      if (!response.ok) {
        throw new Error('API request failed');
      }
      const data = await response.json();
      setPatients(data.patients || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError('Failed to fetch patients. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchPatients();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, currentPage, fetchPatients]);

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (value: string, row: Patient) => (
        <span onClick={() => onRowClick(row.id)} className="font-medium text-blue-600 hover:underline cursor-pointer">
          {value}
        </span>
      ),
    },
    { key: 'age', label: 'Age' },
    { key: 'condition', label: 'Condition' },
    {
      key: 'lastCheckIn',
      label: 'Last Check-in',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    { key: 'status', label: 'Status' },
  ];

  



  return (
    <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
      <SearchInput
        placeholder="ค้นหาด้วยชื่อ..."
        value={searchTerm}
        onChange={(value) => {
          setSearchTerm(value);
          setCurrentPage(1); // Reset to first page on new search
        }}
        onSearch={fetchPatients} // Allow manual search via button
      />

      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <Table columns={columns} data={patients} />
      )}

      {/* Pagination Controls */}
      <div className="flex justify-between items-center pt-4">
        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PatientTable;
