import { useState, useEffect } from 'react';

export interface Community {
  id: string;
  name: string;
  total: number;
  inCare: number;
  transferred: number;
}

export interface UseCommunitiesResult {
  data: Community[];
  loading: boolean;
  error: boolean;
  page: number;
  totalPages: number;
  search: string;
  statusFilter: string;
  sortOrder: 'asc' | 'desc';
  setPage: (p: number) => void;
  setSearch: (s: string) => void;
  setStatusFilter: (s: string) => void;
  toggleSortOrder: () => void;
}

export function useCommunities(): UseCommunitiesResult {
  const [data, setData] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    setLoading(true);
    setError(false);
    const params = new URLSearchParams();
    params.set('page', page.toString());
    if (search) params.set('search', search);
    if (statusFilter !== 'ALL') params.set('status', statusFilter);
    params.set('sort', `name_${sortOrder}`);
    fetch(`/api/communities?${params.toString()}`)
      .then(res => res.json())
      .then((res: { communities: Community[]; totalPages: number }) => {
        setData(res.communities);
        setTotalPages(res.totalPages);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [page, search, statusFilter, sortOrder]);

  const toggleSortOrder = () => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));

  return {
    data,
    loading,
    error,
    page,
    totalPages,
    search,
    statusFilter,
    sortOrder,
    setPage,
    setSearch,
    setStatusFilter,
    toggleSortOrder,
  };
}
