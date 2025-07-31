import React, { useState } from 'react';
import useSWR from 'swr';
import { fetchDriverSchedule, DriverScheduleByDate } from './lib/driverCases';
import { startOfWeek, endOfWeek, eachDayOfInterval, format } from 'date-fns';
import { th } from 'date-fns/locale';
import { Spinner, Button, Tooltip, Badge } from '@/components/ui';
import Link from 'next/link';

interface WeeklyScheduleCalendarProps {}

const Weekdays = ['จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์','อาทิตย์'];

export default function WeeklyScheduleCalendar({}: WeeklyScheduleCalendarProps) {
  const [offset, setOffset] = useState(0);
  const today = new Date();
  const refDate = new Date(today);
  refDate.setDate(refDate.getDate() + offset * 7);
  const start = startOfWeek(refDate, { weekStartsOn: 1 });
  const end = endOfWeek(refDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });

  const { data, error, isValidating, mutate } = useSWR<DriverScheduleByDate>(
    `/api/driver/schedule?startDate=${format(start,'yyyy-MM-dd')}&endDate=${format(end,'yyyy-MM-dd')}`,
    fetchDriverSchedule
  );

  const totalItems = data ? Object.values(data).flat().length : 0;

  return (
    <div className="mt-6">
      {/* Header with navigation */}
      <div className="flex justify-between items-center mb-2">
        <Button size="sm" variant="outline" onClick={() => setOffset(offset - 1)}>ก่อนหน้า</Button>
        <div className="font-medium">
          สัปดาห์ {`${format(start,'dd/MM/', { locale: th })}${start.getFullYear() + 543}`} - {`${format(end,'dd/MM/', { locale: th })}${end.getFullYear() + 543}`}
        </div>
        <Button size="sm" variant="outline" onClick={() => setOffset(offset + 1)}>ถัดไป</Button>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
          {/* Error */}
          {error ? (
            <div className="col-span-full text-center text-red-600">
              เกิดข้อผิดพลาดในการโหลดข้อมูล
              <div className="mt-2">
                <Button size="sm" onClick={() => mutate()}>ลองใหม่</Button>
              </div>
            </div>
          ) : isValidating ? (
            <div className="col-span-full flex justify-center py-10"><Spinner /></div>
          ) : data && totalItems === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-10">ไม่มีตารางงานในสัปดาห์นี้</div>
          ) : data ? (
            days.map((day, idx) => {
              const label = Weekdays[idx];
              const dateStr = `${format(day, 'dd/MM/', { locale: th })}${day.getFullYear() + 543}`;
              const items = data[label] || [];
              const isToday = format(day, 'EEEE', { locale: th }) === format(today, 'EEEE', { locale: th });
              return (
                <div key={label} className={`border p-2 flex flex-col h-48 ${isToday ? 'bg-green-50 border-green-400' : ''}`}> 
                  <div className="font-semibold mb-1">{label}</div>
                  <div className="text-xs text-gray-500 mb-2">{dateStr}</div>
                  <div className="flex-1 overflow-y-auto space-y-1">
                    {items.length > 0 ? (
                      items.map(item => (
                        <Tooltip key={item.id} content={`${item.time} @ ${item.location}`}>
                          <Link href={`/dashboard/driver/cases/${item.id}`} className="block text-sm hover:underline">
                            {item.name}{' '}
                            <Badge status={item.status}>{item.status === 'accepted' ? 'อนุมัติ' : 'รอดำเนินการ'}</Badge>
                          </Link>
                        </Tooltip>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500">ไม่มีเคส</p>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full flex justify-center py-10"><Spinner /></div>
          )}
        </div>
      </div>
    </div>
  );
}
