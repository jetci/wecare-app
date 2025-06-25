import React from 'react';

interface Notification {
  id: string;
  message: string;
}

interface NotificationSummaryProps {
  notifications: Notification[];
}

export default function NotificationSummary({ notifications }: NotificationSummaryProps) {
  return (
    <div data-testid="notification-summary" aria-label="Notification Summary" className="space-y-2">
      {notifications.map(n => (
        <div key={n.id} className="p-2 bg-gray-50 rounded" data-testid={`notification-${n.id}`}>
          {n.message}
        </div>
      ))}
    </div>
  );
}
