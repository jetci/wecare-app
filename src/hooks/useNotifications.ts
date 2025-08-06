import useSWR from 'swr';
import { apiFetch } from '@/lib/api';
import { Notification } from '@prisma/client';

// Define a custom error type
export class FetchError extends Error {
  info: any;
  status: number;

  constructor(message: string, status: number, info: any) {
    super(message);
    this.status = status;
    this.info = info;
  }
}

// Generic fetcher that includes the auth token
const fetcher = async (url: string) => {
  const res = await apiFetch(url);
  if (!res.ok) {
    const info = await res.json();
    const error = new FetchError('An error occurred while fetching the data.', res.status, info);
    throw error;
  }
  return res.json();
};

export function useNotifications() {
  const key = '/api/notifications';
  const { data: notifications, error, isLoading, mutate } = useSWR<Notification[]>(key, fetcher);

  const markAsRead = async (id: string) => {
    // Optimistically update the UI
    mutate(
      (currentNotifications) =>
        currentNotifications?.map((n) => (n.id === id ? { ...n, read: true } : n)),
      false // Do not revalidate immediately
    );

    try {
      await apiFetch(`/api/notifications/${id}/read`, { method: 'PUT' });
      // Trigger revalidation to ensure data consistency
      mutate();
    } catch (error) {
      // If the API call fails, revert the optimistic update
      mutate(); 
      console.error('Failed to mark notification as read:', error);
    }
  };

  return {
    notifications: notifications || [],
    isLoading,
    error,
    markAsRead,
  };
}

