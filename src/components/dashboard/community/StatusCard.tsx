"use client";
import React from 'react';

export interface StatusCardProps {
  label: string;
  count: number;
  bgColor?: string;
}

export function StatusCard({ label, count, bgColor = 'bg-gray-100' }: StatusCardProps) {
  return (
    <div role="region" aria-label={label} className={`${bgColor} p-4 rounded shadow text-center`}>
      <p className="text-sm">{label}</p>
      <p className="text-2xl font-bold" tabIndex={0}>{count}</p>
    </div>
  );
}
