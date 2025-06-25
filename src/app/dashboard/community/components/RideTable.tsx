"use client";
import React from 'react';
import type { Ride } from '@/types/community';

interface RideTableProps {
  rides: Ride[];
  page: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onCancel: (id: string) => void;
}

export default function RideTable({
  rides,
  page,
  totalPages,
  onPrevPage,
  onNextPage,
  onView,
  onEdit,
  onCancel
}: RideTableProps) {
  return (
    <div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Origin</th>
            <th className="p-2 border">Description</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rides.map(r => (
            <tr key={r.id} className="border-t">
              <td className="p-2 border">{r.id}</td>
              <td className="p-2 border">{r.origin}</td>
              <td className="p-2 border">{r.description}</td>
              <td className="p-2 border">{r.status}</td>
              <td className="p-2 border">{new Date(r.date).toLocaleString()}</td>
              <td className="p-2 border space-x-1">
                <button data-testid={`action-view-${r.id}`} onClick={() => onView(r.id)} className="text-blue-600">View</button>
                <button data-testid={`action-edit-${r.id}`} onClick={() => onEdit(r.id)} className="text-yellow-600">Edit</button>
                <button data-testid={`action-cancel-${r.id}`} onClick={() => onCancel(r.id)} className="text-red-600">Cancel</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between items-center mt-2">
        <button data-testid="pagination-prev" onClick={onPrevPage} disabled={page <= 1} className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50">Prev</button>
        <span data-testid="pagination-info">Page {page} of {totalPages}</span>
        <button data-testid="pagination-next" onClick={onNextPage} disabled={page >= totalPages} className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50">Next</button>
      </div>
    </div>
  );
}
