import React from 'react';

interface BadgeProps {
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  children: React.ReactNode;
}

const statusStyles: Record<BadgeProps['status'], string> = {
  pending: 'bg-orange-100 text-orange-800',
  accepted: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export function Badge({ status, children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
        statusStyles[status]
      }`}
    >
      {children}
    </span>
  );
}
