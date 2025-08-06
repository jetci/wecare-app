'use client';

import React from 'react';
import useSWR from 'swr';
import { Notification, User } from '@prisma/client';
import { Trash2, ShieldAlert, Info, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// Define the extended notification type
interface ExtendedNotification extends Notification {
  targetUser: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

// Re-usable fetcher function
const fetcher = async (url: string) => {
  const token = localStorage.getItem('token');
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const error = new Error('Failed to fetch data');
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }
  return res.json();
};

const AdminNotificationsTable = () => {
  const { data: notifications, error, isLoading, mutate } = useSWR<ExtendedNotification[]>('/api/admin/notifications', fetcher);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    const toastId = toast.loading('Deleting notification...');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Failed to delete notification');
      }

      toast.success('Notification deleted successfully', { id: toastId });
      mutate(notifications?.filter((n) => n.id !== id), false); // Optimistic update
    } catch (err) {
      toast.error('Failed to delete notification.', { id: toastId });
      console.error(err);
    }
  };

  if (isLoading) return <div className="text-center p-4">Loading notifications...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Failed to load notifications. Please try again later.</div>;
  if (!notifications || notifications.length === 0) {
    return <div className="text-center p-4 text-gray-500">No notifications found in the system.</div>;
  }

  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case 'USER_APPROVAL':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'WARNING':
        return <ShieldAlert className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white dark:bg-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="py-3 px-4 text-left">Type</th>
            <th className="py-3 px-4 text-left">Recipient</th>
            <th className="py-3 px-4 text-left">Message</th>
            <th className="py-3 px-4 text-left">Status</th>
            <th className="py-3 px-4 text-left">Date</th>
            <th className="py-3 px-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {notifications.map((notification) => (
            <tr key={notification.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
              <td className="py-3 px-4">{getNotificationTypeIcon(notification.type)}</td>
              <td className="py-3 px-4">
                <div>{notification.targetUser.name}</div>
                <div className="text-sm text-gray-500">{notification.targetUser.email}</div>
              </td>
              <td className="py-3 px-4">{notification.message}</td>
              <td className="py-3 px-4">
                {notification.read ? (
                  <span className="px-2 py-1 text-xs font-semibold text-gray-600 bg-gray-200 rounded-full">Read</span>
                ) : (
                  <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-200 rounded-full">Unread</span>
                )}
              </td>
              <td className="py-3 px-4">{new Date(notification.createdAt).toLocaleString()}</td>
              <td className="py-3 px-4">
                <button onClick={() => handleDelete(notification.id)} className="text-red-500 hover:text-red-700">
                  <Trash2 className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminNotificationsTable;
