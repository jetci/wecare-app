import useSWR, { mutate } from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

type User = {
  id: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  role: string;
  approved: boolean;
};

export function useUsers() {
  const { data, error } = useSWR<User[]>('/api/admin/users', fetcher);

  const approveUser = async (id: string) => {
    await fetch(`/api/admin/users/${id}/approve`, { method: 'PATCH' });
    mutate('/api/admin/users');
  };

  const rejectUser = async (id: string) => {
    await fetch(`/api/admin/users/${id}/reject`, { method: 'PATCH' });
    mutate('/api/admin/users');
  };

  return {
    users: data || [],
    isLoading: !error && !data,
    isError: !!error,
    approveUser,
    rejectUser,
  };
}
