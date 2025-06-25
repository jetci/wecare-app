import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

export interface LogItem {
  id: string;
  user?: string;
  userCode?: string;
  userId?: string;
  action: string;
  timestamp: string;
  detail: string;
}

export interface LogsResp {
  logs: LogItem[];
  total: number;
}

/**
 * Hook สำหรับดึงบันทึกกิจกรรม
 * @param enabled fetch เมื่อ true
 * @param from ISO date
 * @param to ISO date
 * @param page current page
 * @param limit items per page
 */
export function useLogs(
  enabled: boolean,
  from: string,
  to: string,
  page: number,
  limit: number
) {
  const key = enabled
    ? `/api/admin/logs?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&page=${page}&limit=${limit}`
    : null;
  return useSWR<LogsResp, Error>(key, fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });
}
