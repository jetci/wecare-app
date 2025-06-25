import React from 'react';
import { renderHook, waitFor, RenderHookResult } from '@testing-library/react';
import { act } from 'react';
import { SWRConfig } from 'swr';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useNotifications } from './useNotifications';
import { Notification } from '@/types';

let mockFetch: ReturnType<typeof vi.fn>;

// SWR wrapper to disable cache without JSX
const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(SWRConfig, { value: { provider: () => new Map(), dedupingInterval: 0 } }, children);

describe('useNotifications', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockFetch = vi.fn();
    global.fetch = mockFetch as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('loads notifications successfully', async () => {
    const data: Notification[] = [{ id: '1', message: 'Test' }];
    mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve(data) } as any);

    const { result } = renderHook(() => useNotifications(), { wrapper });
    await waitFor(() => expect(result.current.notifications).toEqual(data));

    expect(result.current.error).toBeUndefined();
    expect(result.current.isLoading).toBeFalsy();
  });

  it('handles error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('fail'));

    const { result } = renderHook(() => useNotifications(), { wrapper });
    await waitFor(() => expect(result.current.error).toBeDefined());

    expect(result.current.notifications).toEqual([]);
  });

  it('returns empty when no notifications', async () => {
    mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve([]) } as any);
    let hook!: RenderHookResult<ReturnType<typeof useNotifications>, unknown>;
    // wrap renderHook inside act to avoid warning
    await act(async () => {
      hook = renderHook(() => useNotifications(), { wrapper });
    });
    // wait for state update
    await waitFor(() => expect(hook.result.current.notifications).toEqual([]));
    expect(hook.result.current.notifications).toEqual([]);
  });

  it('refetch works', async () => {
    const data1: Notification[] = [{ id: '1', message: 'A' }];
    const data2: Notification[] = [{ id: '2', message: 'B' }];
    mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve(data1) } as any);
    mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve(data2) } as any);

    const { result } = renderHook(() => useNotifications(), { wrapper });
    await waitFor(() => expect(result.current.notifications).toEqual(data1));

    act(() => {
      result.current.refetch();
    });
    await waitFor(() => expect(result.current.notifications).toEqual(data2));
  });

  it('deleteNotification mutates cache', async () => {
    const initial: Notification[] = [{ id: '1', message: 'X' }];
    const after: Notification[] = [];

    mockFetch
      .mockResolvedValueOnce({ json: () => Promise.resolve(initial) } as any) // initial GET
      .mockResolvedValueOnce({ ok: true } as any)                         // DELETE
      .mockResolvedValueOnce({ json: () => Promise.resolve(after) } as any); // refetch GET

    const { result } = renderHook(() => useNotifications(), { wrapper });
    await waitFor(() => expect(result.current.notifications).toEqual(initial));

    // perform deleteNotification inside act and capture result
    let success: boolean;
    await act(async () => {
      success = await result.current.deleteNotification('1');
    });
    expect(success!).toBe(true);

    // Wait for refetch after delete
    await waitFor(() => expect(result.current.notifications).toEqual(after));
  });
});
