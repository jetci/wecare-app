import React from 'react';

interface KpiCardProps {
  title: string;
  count: number;
  suffix?: string;
  color?: string;
  testId?: string;
}

export function KpiCard({ title, count, suffix = '', color = 'bg-blue-500', testId }: KpiCardProps) {
  return (
    <div data-testid={testId} className={`p-4 rounded shadow text-white ${color}`}>
      <p className="text-sm">{title}</p>
      <p className="text-2xl font-bold">{count}{suffix}</p>
    </div>
  );
}
