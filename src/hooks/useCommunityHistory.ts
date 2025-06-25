import { useState, useEffect } from 'react';
import useSWR from 'swr';

// Fetcher with debug log
const fetcher = (url: string) => {
  console.log('📥 fetch started:', url);
  return fetch(url).then(res => res.json());
};

/**
 * Custom hook to fetch community history with pagination and filters.
 */
export function useCommunityHistory(
  communityId: string,
  from: string,
  to: string
) {
  const [page, setPage] = useState(1);
  const key = communityId
    ? `/api/communities/${communityId}/history?page=${page}&from=${from}&to=${to}`
    : null;
  console.log('🔍 useCommunityHistory key:', key);
  const { data, error, isLoading } = useSWR<{ items: any[] }>(key, fetcher);

  const [itemsList, setItemsList] = useState<any[]>([]);
  useEffect(() => {
    if (data?.items) {
      setItemsList(prev => (page === 1 ? data.items : [...prev, ...data.items]));
    }
  }, [data, page]);

  const loadMore = () => setPage(p => p + 1);

  return { itemsList, isLoading, error, loadMore };
}
