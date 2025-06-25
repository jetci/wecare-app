import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

export interface RoleItem {
  id: string;
  name: string;
  permissions: string[];
}

export interface RolesResp {
  roles: RoleItem[];
}

/**
 * Hook สำหรับดึงบทบาทและสิทธิ์
 * @param enabled fetch เมื่อ true
 */
export function useRoles(enabled: boolean) {
  const key = enabled ? '/api/admin/roles' : null;
  return useSWR<RolesResp, Error>(key, fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });
}
