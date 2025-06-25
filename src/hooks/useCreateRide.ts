import { useState } from 'react';
import { useSWRConfig } from 'swr';
import type { Ride } from '@/types/api';

/**
 * Hook to create a new ride request for a user and revalidate ride list
 */
export function useCreateRide(userId: string | null) {
  const { mutate } = useSWRConfig();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRide = async (payload: Record<string, any>) => {
    if (!userId) throw new Error('No user ID');
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/rides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...payload }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Create ride failed');
      }
      await mutate(`/api/rides?userId=${userId}`);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createRide, loading, error };
}
