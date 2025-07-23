'use client';

import React, { useState, useRef, useEffect } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationDropdown() {
  const { notifications, isLoading, error, refetch, deleteNotification } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const listNotifications = Array.isArray(notifications) ? notifications : [];
  const unread = listNotifications.filter(n => !n.read).length;

  const handleMarkRead = async (id: string) => {
    try {
      await deleteNotification(id);
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
        onClick={() => setOpen(o => !o)}>
        <BellIcon className="h-6 w-6" />
        {unread > 0 && (
          <span className="absolute top-0 right-0 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-xs text-white">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 max-h-80 overflow-y-auto rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="p-2">
            <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
          </div>
          <ul>
            {isLoading && <li className="p-2 text-sm text-gray-500">Loading...</li>}
            {error && <li className="p-2 text-sm text-red-500">Error loading</li>}
            {!isLoading && notifications.length === 0 && (
              <li className="p-2 text-sm text-gray-500">No notifications</li>
            )}
            {listNotifications.map(n => (
              <li key={n.id} className={`flex items-start justify-between p-2 hover:bg-gray-100 ${n.read ? 'opacity-50' : ''}`}> 
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{n.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}</p>
                </div>
                {!n.read && (
                  <button
                    className="ml-2 text-blue-500 text-xs"
                    onClick={() => handleMarkRead(n.id)}>
                    Mark read
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
