import React from 'react';

export interface TimelineProps {
  data: { id: string; date?: string; event?: string; caretaker?: string }[];
}

export default function Timeline({ data }: TimelineProps) {
  if (!data.length) {
    return <p data-testid="timeline-empty">ไม่มีข้อมูลประวัติ</p>;
  }

  return (
    <ul data-testid="timeline-list" className="space-y-2">
      {data.map(item => (
        <li key={item.id} className="border p-2 rounded">
          <strong>{item.date || item.id}</strong>: {item.event || '-'} - {item.caretaker || '-'}
        </li>
      ))}
    </ul>
  );
}
