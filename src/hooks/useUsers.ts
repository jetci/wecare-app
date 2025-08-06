import useSWR from 'swr';
import { apiFetch } from '@/lib/api-fetch';
import { UserRole, UserPosition } from '@prisma/client';

// This type defines the shape of the user data returned by our API
export type UserData = {
  id: string;
  nationalId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  position: UserPosition | null;
  isApproved: boolean;
  createdAt: string;
};

const fetcher = (url: string) => apiFetch<UserData[]>(url);

export function useUsers() {
  const { data, error, isLoading } = useSWR('/api/admin/users', fetcher);

  return {
    users: data,
    isLoading,
    isError: error,
  };
}

