import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest';
import { useCommunityHistory } from './useCommunityHistory';

// Ensure fetch mock
let mockFetch: ReturnType<typeof vi.fn>;
beforeEach(() => {
  vi.useFakeTimers();
  mockFetch = vi.fn();
  global.fetch = mockFetch as unknown as typeof fetch;
});
afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

// Wrapper to provide SWR context without JSX
const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children
  );

describe('useCommunityHistory', () => {
  it('does not fetch when communityId is empty', () => {
    const { result } = renderHook(
      () => useCommunityHistory('', '', ''),
      { wrapper }
    );
    expect(result.current.itemsList).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('fetches and paginates correctly', async () => {
    const page1 = { items: [{ id: '1' }, { id: '2' }] };
    const page2 = { items: [{ id: '3' }] };
    mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve(page1) } as any);
    mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve(page2) } as any);

    const { result } = renderHook(
      () => useCommunityHistory('123', '', ''),
      { wrapper }
    );
    // wait for initial fetch
    await waitFor(() => {
      expect(result.current.itemsList).toEqual(page1.items);
    });
    // load next page
    act(() => result.current.loadMore());
    await waitFor(() => {
      expect(result.current.itemsList).toEqual([...page1.items, ...page2.items]);
    });
  });

  it('sets error when fetch fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network Error'));
    const { result } = renderHook(() => useCommunityHistory('123', '', ''), { wrapper });
    await waitFor(() => {
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.itemsList).toEqual([]);
    });
  });

  it('reports isLoading correctly', async () => {
    const data = { items: [{ id: '1' }] };
    let resolveFetch: (value: any) => void;
    mockFetch.mockReturnValueOnce(new Promise(res => { resolveFetch = res; }) as any);
    const { result } = renderHook(() => useCommunityHistory('123', '', ''), { wrapper });
    expect(result.current.isLoading).toBe(true);
    act(() => resolveFetch({ json: () => Promise.resolve(data) }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });
});
