import useSWR from 'swr';
import { Notification } from '@/types';

// Fetcher for notifications
const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then(res => res.json());

export function useNotifications() {
  const key = '/api/notifications';
  const { data, error, isLoading, mutate } = useSWR<Notification[]>(key, fetcher);

  const notifications = data ?? [];

  // Refetch notifications
  const refetch = () => mutate();

  // Delete a notification and update cache
  const deleteNotification = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      await mutate();
      return true;
    } catch {
      return false;
    }
  };

  return { notifications, isLoading, error, refetch, deleteNotification };
}
