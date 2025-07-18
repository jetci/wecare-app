import useSWR from 'swr';
import { useAuth } from '@/context/AuthContext';
import { fetcher } from '@/lib/fetcher';
import { Role, User } from '@prisma/client';

// Interface สำหรับข้อมูล Meta ของ Pagination
interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Interface สำหรับ Response ทั้งหมดจาก API
interface UsersApiResponse {
  success: true;
  users: User[];
  meta: Meta;
}

// Interface สำหรับ Parameters ที่ Hook รับเข้ามา
interface UseAdminUsersParams {
  role?: Role;
  approved?: boolean;
  page?: number;
  limit?: number;
}

export function useAdminUsers(params: UseAdminUsersParams) {
  const { token } = useAuth();

  // สร้าง Query String จาก Parameters
  const query = new URLSearchParams();
  if (params.role)    query.append('role', params.role);
  if (params.approved !== undefined) query.append('approved', String(params.approved));
  if (params.page)    query.append('page', String(params.page));
  if (params.limit)   query.append('limit', String(params.limit));
  const queryString = query.toString();
  const apiUrl = `/api/admin/users${queryString ? `?${queryString}` : ''}`;

  // SWR key จะ null ถ้าไม่มี token
  const key = token ? [apiUrl, token] : null;

  const { data, error, isLoading, mutate } = useSWR<UsersApiResponse>(key, fetcher);

  return {
    users: data?.users ?? [],
    meta: data?.meta,
    isLoading,
    isError: !!error,
    mutate,
  };
}
