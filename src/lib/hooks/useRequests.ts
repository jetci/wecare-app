import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import type { Role } from '@prisma/client';

export interface RequestUser {
  id: string;
  prefix: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export interface RequestsResp {
  users: RequestUser[];
  total: number;
}

/**
 * Hook to fetch pending admin user requests (approved=false)
 * @param enabled fetch when true
 */
export function useRequests(enabled: boolean) {
  const key = enabled ? '/api/admin/users?approved=false' : null;
  return useSWR<RequestsResp, Error>(key, fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });
}
