import useSWR, { mutate } from 'swr';
import apiFetch from '@/lib/apiFetch';

export interface RideCase {
  id: string;
  status: string;
  driverId: string | null;
  patient: any;
}

interface ResponseData {
  success: boolean;
  cases: RideCase[];
}

const fetcher = (url: string) => apiFetch(url);

/**
 * React hook to fetch and manage driver cases
 */
export function useDriverCases() {
  const { data, error, isValidating } = useSWR<ResponseData>('/api/driver/cases', fetcher);
  const cases = data?.cases || [];

  const acceptCase = async (id: string) => {
    await apiFetch('/api/driver/cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'accept' }),
    });
    mutate('/api/driver/cases');
  };

  const completeCase = async (id: string) => {
    await apiFetch('/api/driver/cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'complete' }),
    });
    mutate('/api/driver/cases');
  };

  return {
    cases,
    isLoading: !error && !data,
    isError: !!error,
    isValidating,
    acceptCase,
    completeCase,
  };
}
