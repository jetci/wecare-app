import { renderHook, act } from '@testing-library/react-hooks';
import { useFilterState } from './useFilterState';

type Item = { id: number; status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'; name: string };
const items: Item[] = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  status: i % 3 === 0 ? 'PENDING' : i % 3 === 1 ? 'IN_PROGRESS' : 'COMPLETED',
  name: `Item${i + 1}`
}));

describe('useFilterState', () => {
  it('initializes with full list paged', () => {
    const { result } = renderHook(() => useFilterState({ items, getStatus: i => i.status, pageSize: 10 }));
    expect(result.current.items.length).toBe(10);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.page).toBe(1);
  });

  it('filters by status', () => {
    const { result } = renderHook(() => useFilterState({ items, getStatus: i => i.status, pageSize: 10 }));
    act(() => result.current.setStatusFilter('PENDING'));
    const allPending = items.filter(i => i.status === 'PENDING');
    expect(result.current.items).toEqual(allPending.slice(0, 10));
    expect(result.current.totalPages).toBe(Math.ceil(allPending.length / 10));
  });

  it('searches by text', () => {
    const { result } = renderHook(() => useFilterState({ items, getStatus: i => i.status, pageSize: 50 }));
    act(() => result.current.setSearchText('Item2'));
    expect(result.current.items.every(i => i.name.includes('Item2'))).toBe(true);
    expect(result.current.totalPages).toBe(1);
  });

  it('paginates correctly', () => {
    const { result } = renderHook(() => useFilterState({ items, getStatus: i => i.status, pageSize: 5 }));
    expect(result.current.page).toBe(1);
    act(() => result.current.nextPage());
    expect(result.current.page).toBe(2);
    act(() => result.current.prevPage());
    expect(result.current.page).toBe(1);
  });
});
