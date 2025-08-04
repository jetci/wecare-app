import { useState, useMemo } from 'react';

type StatusFilter = 'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
const PAGE_SIZE = 10;

interface UseFilterStateOptions<T> {
  items: T[];
  getStatus: (item: T) => StatusFilter;
  pageSize?: number;
}

export function useFilterState<T>({ items, getStatus, pageSize = PAGE_SIZE }: UseFilterStateOptions<T>) {
  const [searchText, setSearchText] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [page, setPage] = useState<number>(1);

  const filteredItems = useMemo(() => {
    let list = items;
    if (statusFilter !== 'ALL') {
      list = list.filter(i => getStatus(i) === statusFilter);
    }
    if (searchText) {
      const query = searchText.toLowerCase();
      list = list.filter(i => JSON.stringify(i).toLowerCase().includes(query));
    }
    return list;
  }, [items, statusFilter, searchText, getStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const pagedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, page, pageSize]);

  const nextPage = () => setPage(p => Math.min(p + 1, totalPages));
  const prevPage = () => setPage(p => Math.max(p - 1, 1));

  return {
    searchText,
    setSearchText,
    statusFilter,
    setStatusFilter,
    page,
    totalPages,
    items: pagedItems,
    nextPage,
    prevPage,
  };
}
