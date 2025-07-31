'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { fetchWeeklySummary, WeeklySummary } from './lib/driverCases';
import WeeklyScheduleCalendar from './WeeklyScheduleCalendar';
import RoleGuard from '@/components/RoleGuard';
import { Role } from '@/types/roles';
import { useRouter } from 'next/navigation';
import { Card, Button, ConfirmationModal } from '@/components/ui';

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { unparse } from 'papaparse';

export default function DriverDashboardPage() {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [exportType, setExportType] = useState<'pdf'|'csv'>('pdf');

  // Weekly summary
  const { data: weeklySummary, error: summaryError } = useSWR<WeeklySummary>(
    '/api/driver/cases/weekly-summary',
    fetchWeeklySummary
  );
  const totalCases = weeklySummary
    ? weeklySummary.reduce((sum, d) => sum + d.approved + d.pending + d.canceled, 0)
    : 0;

  // Export
  const handleExport = (type: 'pdf'|'csv') => {
    if (!weeklySummary) return;
    const ts = Date.now();
    if (type === 'pdf') {
      const doc = new jsPDF();
      autoTable(doc, {
        head: [['วัน', 'อนุมัติ', 'รอดำเนินการ', 'ยกเลิก']],
        body: weeklySummary.map(d => [d.date, d.approved, d.pending, d.canceled]),
      });
      doc.save(`รายงานสัปดาห์-${ts}.pdf`);
    } else {
      const csv = unparse(weeklySummary, { header: true, columns: ['date','approved','pending','canceled'] });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `รายงานสัปดาห์-${ts}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <RoleGuard allowedRoles={[Role.DRIVER, Role.DEVELOPER]}>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">แดชบอร์ดคนขับ</h1>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="flex flex-col items-center justify-center p-6">
            <h2 className="text-lg font-semibold mb-2">แจ้งเคสใหม่</h2>
            <Button onClick={() => router.push('/dashboard/driver/cases')} className="w-full">
              ไปยังเคสใหม่
            </Button>
          </Card>
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-2">ข่าวสาร / ประกาศ</h2>
            <p className="text-sm text-gray-600">ระบบจะแจ้งข่าวสารและประกาศต่างๆ ที่นี่</p>
          </Card>
        </div>

        <WeeklyScheduleCalendar />

        {/* Export summary */}
        <ConfirmationModal
          open={confirmOpen}
          title="ยืนยันการส่งออก"
          message={`ต้องการส่งออกเป็น ${exportType.toUpperCase()} หรือไม่?`}
          onConfirm={() => { handleExport(exportType); setConfirmOpen(false); }}
          onCancel={() => setConfirmOpen(false)}
        />
        <Card className="p-6 mt-6">
          <h2 className="text-lg font-semibold mb-2">สรุปรายงานเคสรายสัปดาห์</h2>
          <div className="mb-2 text-sm font-medium">สัปดาห์นี้มีทั้งหมด {totalCases} เคส</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr>
                  <th className="px-2 py-1">วัน</th>
                  <th className="px-2 py-1">อนุมัติ</th>
                  <th className="px-2 py-1">รอดำเนินการ</th>
                  <th className="px-2 py-1">ยกเลิก</th>
                </tr>
              </thead>
              <tbody>
                {summaryError && (
                  <tr><td colSpan={4} className="px-2 py-1 text-red-500">โหลดข้อมูลไม่สำเร็จ</td></tr>
                )}
                {!weeklySummary ? (
                  <tr><td colSpan={4} className="px-2 py-1">กำลังโหลด...</td></tr>
                ) : (
                  weeklySummary.map(d => (
                    <tr key={d.date}>
                      <td className="px-2 py-1">{d.date}</td>
                      <td className="px-2 py-1">{d.approved}</td>
                      <td className="px-2 py-1">{d.pending}</td>
                      <td className="px-2 py-1">{d.canceled}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <Button variant="outline" size="sm" onClick={() => { setExportType('pdf'); setConfirmOpen(true); }} disabled={!weeklySummary}>
              ส่งออก PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setExportType('csv'); setConfirmOpen(true); }} disabled={!weeklySummary}>
              ส่งออก CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/driver/cases')}>
              ดูทั้งหมด
            </Button>
          </div>
        </Card>
      </div>
    </RoleGuard>
  );
}