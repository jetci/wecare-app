"use client";
import React from 'react';

export interface ProfileCardProps {
  name: string;
  nationalId: string;
  phone: string;
}

export function ProfileCard({ name, nationalId, phone }: ProfileCardProps) {
  return (
    <div role="region" aria-label="Profile" className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-2">โปรไฟล์</h2>
      <p>ชื่อ: {name}</p>
      <p>รหัสบัตร: {nationalId}</p>
      <p>โทร: {phone}</p>
    </div>
  );
}
