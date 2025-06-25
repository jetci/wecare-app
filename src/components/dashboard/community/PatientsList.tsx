"use client";
import React from 'react';

export interface PatientsListProps {
  patients: { id: string; name: string; age: number }[];
}

export function PatientsList({ patients }: PatientsListProps) {
  return (
    <div role="region" aria-label="Patients Under Care" className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-2">ข้อมูลผู้ป่วยในความดูแล</h2>
      {patients.length > 0 ? (
        <ul className="list-disc list-inside">
          {patients.map(p => (
            <li key={p.id}>{p.name} ({p.age} ปี)</li>
          ))}
        </ul>
      ) : (
        <p>ยังไม่มีผู้ป่วยในความดูแล</p>
      )}
    </div>
  );
}
