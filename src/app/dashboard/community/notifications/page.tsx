"use client";
import React, { useState, useMemo } from 'react';
import useSWR from 'swr';
import { Spinner } from '@/components/ui/Spinner';

export interface Notification {
  id: string;
  date: string;
  sender: string;
  type: 'info' | 'warning';
  message: string;
}

export default function CommunityNotificationsPage({ params }: { params: { communityId: string } }) {
  const communityId = params.communityId;
  const [typeFilter, setTypeFilter] = useState<'all' | 'info' | 'warning'>('all');
  const [keyword, setKeyword] = useState('');
  const { data, error, isLoading } = useSWR<Notification[]>(
    `/api/communities/${communityId}/notifications`,
    (url: string) => fetch(url).then(res => res.json())
  );

  if (isLoading) return <div role="status" className="p-4"><Spinner /></div>;
  if (error) return <div role="alert" className="p-4 text-red-500">เกิดข้อผิดพลาดในการโหลดการแจ้งเตือน</div>;

  const filtered = useMemo(() => {
    const items = data || [];
    return items.filter(n =>
      (typeFilter === 'all' || n.type === typeFilter) &&
      n.message.toLowerCase().includes(keyword.toLowerCase())
    );
  }, [data, typeFilter, keyword]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">การแจ้งเตือนย้อนหลัง</h1>
      <div className="flex flex-col md:flex-row md:items-center mb-4 space-y-2 md:space-y-0 md:space-x-2">
        <select
          aria-label="ประเภทการแจ้งเตือน"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value as any)}
          className="border p-2 rounded"
        >
          <option value="all">ทั้งหมด</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
        </select>
        <input
          type="text"
          aria-label="ค้นหา"
          placeholder="ค้นหาข้อความ..."
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          className="border p-2 rounded flex-1"
        />
      </div>
      <ul className="space-y-4">
        {filtered.map(n => (
          <li key={n.id} className="border p-4 rounded flex flex-col md:flex-row md:justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-500">{n.date} by {n.sender}</p>
              <p className="mt-1">{n.message}</p>
            </div>
            <span
              className={`mt-2 md:mt-0 md:ml-4 px-2 py-1 rounded text-white ${n.type === 'info' ? 'bg-blue-500' : 'bg-yellow-500'}`}>
              {n.type.toUpperCase()}
            </span>
          </li>
        ))}
        {filtered.length === 0 && <p data-testid="no-notifications">ไม่พบการแจ้งเตือน</p>}
      </ul>
    </div>
  );
}
