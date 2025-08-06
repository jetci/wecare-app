import useSWR from 'swr';
import { User, Role, Position } from '@prisma/client';

interface UsersApiResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

const fetcher = (url: string) => fetch(url, {
  headers: {
    // Assuming the token is stored in localStorage
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
}).then((res) => {
  if (!res.ok) {
    throw new Error('An error occurred while fetching the data.');
  }
  return res.json();
});

export const useAdminUserManagement = (page: number, limit: number, search: string) => {
  const searchParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    search: search,
  });

  const { data, error, mutate } = useSWR<UsersApiResponse>(
    `/api/users?${searchParams.toString()}`,
    fetcher
  );

  const approveUser = async (userId: string) => {
    await fetch(`/api/users/${userId}/approve`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    mutate(); // Re-fetch the user list
  };

  const updateUserRole = async (userId: string, role?: Role, position?: Position) => {
    await fetch(`/api/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ role, position }),
    });
    mutate(); // Re-fetch the user list
  };

  return {
    data,
    isLoading: !error && !data,
    isError: error,
    approveUser,
    updateUserRole,
    mutate,
  };
};
