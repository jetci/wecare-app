import useSWR from 'swr';
import { Notification } from '@/types/notification';

interface NotificationsResponse {
  success: boolean;
  notifications: Notification[];
}

// Fetcher for notifications array
const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then(res => res.json() as Promise<Notification[]>);

export function useNotifications() {
    const key = '/api/notifications';
  const { data, error, isLoading, mutate } = useSWR<Notification[] | NotificationsResponse>(key, fetcher);

  // Normalize response shape to Notification[]

  let notifications: Notification[] = [];
  if (Array.isArray(data)) notifications = data;
  else if (data && 'notifications' in data) notifications = data.notifications;

  // Refetch notifications
  const refetch = () => mutate();

  // Mark a notification as read and update cache
  const deleteNotification = async (id: string) => {
    const res = await fetch(key, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id }),
    });
    if (!res.ok) throw new Error('Failed to mark notification as read');
    await mutate();
    return true;
  };

  return { notifications, isLoading, error, refetch, deleteNotification };
}
