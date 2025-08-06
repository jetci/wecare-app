import React from 'react';
import AdminNotificationsTable from '@/components/admin/AdminNotificationsTable';

export default function AdminNotificationsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Notifications</h1>
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <AdminNotificationsTable />
      </div>
    </div>
  );
}
