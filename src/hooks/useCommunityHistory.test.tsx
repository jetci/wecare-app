import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest';
import { useCommunityHistory } from './useCommunityHistory';

let mockFetch: ReturnType<typeof vi.fn>;

function HistoryWrapper({ communityId, startDate, endDate }: { communityId: string; startDate: string; endDate: string; }) {
  const { itemsList, error, isLoading, loadMore } = useCommunityHistory(communityId, startDate, endDate);
  return (
    <>
      <div data-testid="items">{JSON.stringify(itemsList)}</div>
      <div data-testid="err">{error?.toString() || ''}</div>
      <button data-testid="more" onClick={() => loadMore()}>loadMore</button>
    </>
  );
}

describe('useCommunityHistory', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockFetch = vi.fn();
    global.fetch = mockFetch as any;
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  const wrapper = (ui: React.ReactNode) => (
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      {ui}
    </SWRConfig>
  );

  it('does not fetch when communityId is empty', () => {
    render(wrapper(<HistoryWrapper communityId="" startDate="" endDate="" />));
    expect(screen.getByTestId('items').textContent).toBe('[]');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('fetches and paginates correctly', async () => {
    const page1 = { items: [{ id: '1' }, { id: '2' }] };
    const page2 = { items: [{ id: '3' }] };
    mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve(page1) } as any)
             .mockResolvedValueOnce({ json: () => Promise.resolve(page2) } as any);
    render(wrapper(<HistoryWrapper communityId="123" startDate="" endDate="" />));
    await waitFor(() => expect(screen.getByTestId('items').textContent).toBe(JSON.stringify(page1.items)));
    fireEvent.click(screen.getByTestId('more'));
    await waitFor(() => expect(screen.getByTestId('items').textContent).toBe(JSON.stringify([...page1.items, ...page2.items])));
  });

  it('sets error when fetch fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network Error'));
    render(wrapper(<HistoryWrapper communityId="123" startDate="" endDate="" />));
    await waitFor(() => expect(screen.getByTestId('err').textContent).not.toBe(''));
    expect(screen.getByTestId('items').textContent).toBe('[]');
  });

  it('reports isLoading correctly', async () => {
    const data = { items: [{ id: '1' }] };
    let resolveFn!: (value: any) => void;
    mockFetch.mockReturnValueOnce(new Promise(res => { resolveFn = res; }) as any);
    render(wrapper(<HistoryWrapper communityId="123" startDate="" endDate="" />));
    expect(screen.getByTestId('items').textContent).toBe('[]');
    act(() => resolveFn({ json: () => Promise.resolve(data) }));
    await waitFor(() => expect(screen.getByTestId('items').textContent).toBe(JSON.stringify(data.items)));
  });
});
