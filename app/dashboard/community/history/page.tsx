"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCommunityHistory } from '../../../../hooks/useCommunityHistory';
import type { TimelineProps } from '../../../../components/dashboard/community/Timeline';
import { Spinner } from '../../../../components/ui/Spinner';
import Timeline from '../../../../components/dashboard/community/Timeline';
import RoleGuard from '@/components/RoleGuard';
import { Role } from '@/types/roles';

export default function CommunityHistoryPage() {
  const params = useParams();
  const communityId = Array.isArray(params.id) ? params.id[0] : params.id ?? '123';
  const [rawFrom, setRawFrom] = useState('');
  const [rawTo, setRawTo] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    const h = setTimeout(() => setFrom(rawFrom), 300);
    return () => clearTimeout(h);
  }, [rawFrom]);
  useEffect(() => {
    const h = setTimeout(() => setTo(rawTo), 300);
    return () => clearTimeout(h);
  }, [rawTo]);

  // ใช้ custom hook SWR fetch
  const { itemsList, isLoading, error, loadMore } = useCommunityHistory(
    communityId,
    from,
    to
  );

  if (isLoading) return (
    <div role="status" className="p-4"><Spinner /></div>
  );
  if (error) return (
    <div role="alert" className="p-4 text-red-500">เกิดข้อผิดพลาดในการโหลดประวัติ</div>
  );

  return (
    <RoleGuard allowedRoles={[Role.COMMUNITY]}>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-2">ประวัติการแจ้ง</h1>
        {/* List of id - status for tests */}
        <ul data-testid="history-list" aria-live="polite" role="region" className="space-y-2">
          {itemsList.map((r: any) => (
            <li data-testid="history-item" key={r.id} className="border p-2 rounded">{r.id} — {r.status}</li>
          ))}
        </ul>
        {/* Date range filters */}
        <div className="flex space-x-2 mb-4">
          <input
            id="from-date"
            type="date"
            aria-label="จากวันที่"
            value={rawFrom}
            onChange={e => setRawFrom(e.target.value)}
            className="border p-1 rounded"
          />
          <input
            id="to-date"
            type="date"
            aria-label="ถึงวันที่"
            value={rawTo}
            onChange={e => setRawTo(e.target.value)}
            className="border p-1 rounded"
          />
        </div>
        {/* Timeline component */}
        <Timeline data={itemsList} />
        {/* Fallback table view */}
        <table data-testid="history-table" aria-label="History Table" className="min-w-full border-collapse mt-4">
          <thead>
            <tr>
              <th className="border p-2">วันที่</th>
              <th className="border p-2">เหตุการณ์</th>
              <th className="border p-2">ผู้ดูแล</th>
            </tr>
          </thead>
          <tbody>
            {itemsList.map((item: any) => (
              <tr key={item.id} className="border-t">
                <td className="p-2">{item.date}</td>
                <td className="p-2">{item.event}</td>
                <td className="p-2">{item.caretaker}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          data-testid="load-more"
          onClick={loadMore}
          aria-label="โหลดเพิ่มเติม"
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >โหลดเพิ่มเติม</button>
      </div>
    </RoleGuard>
  );
}
