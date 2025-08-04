"use client";
import React, { useState } from 'react';
import { Spinner } from '@/components/ui/Spinner';
import { Card } from '@/components/ui/Card';
import toast from 'react-hot-toast'; 
import { Notification } from '@/types';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuth } from '@/context/AuthContext';

export default function NotificationsPage() {
  const { isAdmin } = useAuth();
  if (!isAdmin) {
    return <p data-testid="notifications-unauthorized" className="p-6">สิทธิ์ไม่เพียงพอ</p>;
  }

  const { notifications, isLoading, error, deleteNotification } = useNotifications();
  const [viewModal, setViewModal] = useState(false);
  const [selected, setSelected] = useState<Notification|null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string|null>(null);

  if (isLoading) return <div data-testid="notifications-loading" className="p-6"><Spinner /></div>;
  if (error) return <p data-testid="notifications-error" className="p-6 text-red-500">ไม่สามารถโหลดแจ้งเตือนได้</p>;
  if (!notifications?.length) return <p data-testid="no-notifications" className="p-6">ไม่มีแจ้งเตือนใหม่</p>;

  return (
    <> 
      <div data-testid="notifications-container" className="p-6 flex flex-wrap gap-4">
        <h1 className="text-2xl font-bold">แจ้งเตือน</h1>
        {notifications?.map((n: Notification) => (
          <Card key={n.id} data-testid="notification-card" className="max-w-md p-4">
            <p>{n.message}</p>
            <div className="mt-2 flex gap-2">
              <button data-testid={`notification-view-${n.id}`} aria-label="View notification" onClick={() => { setSelected(n); setViewModal(true); }} className="text-blue-600 underline">View</button>
              <button data-testid={`notification-delete-${n.id}`} aria-label="Delete notification" onClick={async () => {
                  setDeleteLoading(n.id);
                  const ok = await deleteNotification(n.id);
                  if (ok) toast.success('Deleted'); else toast.error('Delete failed');
                  setDeleteLoading(null);
                }} className="text-red-600 underline">
                { deleteLoading === n.id ? 'Deleting...' : 'Delete' }
              </button>
            </div>
          </Card>
        ))}
      </div>
      {viewModal && selected && (
        <div data-testid="view-modal" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded">
            <h2 className="font-bold">Notification Detail</h2>
            <p data-testid="view-message" className="mt-2">{selected.message}</p>
            <button data-testid="view-close" onClick={() => setViewModal(false)} className="mt-4 px-4 py-2 bg-gray-200 rounded">Close</button>
          </div>
        </div>
      )}
    </>
  );
}