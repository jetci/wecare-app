import React, { useState } from 'react';
import { Bell, Circle } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { Notification } from '@prisma/client';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, isLoading, error, markAsRead } = useNotifications();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    // Optional: Add navigation logic here, e.g., router.push(notification.link)
  };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 rounded-full hover:bg-gray-200">
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-20">
          <div className="p-4 font-bold border-b">Notifications</div>
          <div className="py-1 max-h-96 overflow-y-auto">
            {isLoading && <div className="p-4 text-center">Loading...</div>}
            {error && <div className="p-4 text-center text-red-500">Failed to load notifications.</div>}
            {!isLoading && !error && notifications.length === 0 && (
              <div className="p-4 text-center text-gray-500">No new notifications.</div>
            )}
            {!isLoading && !error && notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`flex items-start p-4 hover:bg-gray-100 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}>
                <div className="flex-shrink-0 pt-1">
                  <Circle className={`h-2.5 w-2.5 ${notification.read ? 'text-gray-300' : 'text-blue-500'}`} fill="currentColor" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-700">{notification.message}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
