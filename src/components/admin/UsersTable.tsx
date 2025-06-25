"use client";
import React, { useState } from 'react';
import useSWR from 'swr';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

// Type for API user
interface ApiUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

// Row data for table
interface RowUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Response shape from endpoint
interface UsersResponse {
  users: ApiUser[];
  total: number;
}

// Basic fetcher with auth header
const fetcher = (url: string) =>
  fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } })
    .then(res => { if (!res.ok) throw new Error('Fetch error'); return res.json(); });

export default function UsersTable() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { data, error, isLoading } = useSWR<UsersResponse>(
    `/api/admin/users?page=${page}&limit=${pageSize}`,
    fetcher
  );

  if (isLoading) return <div className="flex justify-center py-4"><Spinner /></div>;
  if (error) return <p className="text-red-500">เกิดข้อผิดพลาด: {(error as Error).message}</p>;

  const rows: RowUser[] = data?.users.map(u => ({
    id: u.id,
    name: `${u.firstName} ${u.lastName}`,
    email: u.email,
    role: u.role,
  })) || [];

  const totalPages = Math.max(1, Math.ceil((data?.total || 0) / pageSize));

  const columns: { key: keyof RowUser; label: string }[] = [
    { key: 'name', label: 'ชื่อ' },
    { key: 'email', label: 'อีเมล' },
    { key: 'role', label: 'บทบาท' },
  ];

  return (
    <div>
      <Table<RowUser> columns={columns} data={rows} />
      <div className="flex items-center justify-end space-x-2 mt-4">
        <Button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
        <span>{page} / {totalPages}</span>
        <Button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
      </div>
    </div>
  );
}
