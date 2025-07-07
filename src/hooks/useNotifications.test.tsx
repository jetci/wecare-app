import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest';
import { useNotifications } from './useNotifications';

let mockFetch: ReturnType<typeof vi.fn>;

function NotificationsWrapper() {
  const { notifications, error, refetch, deleteNotification } = useNotifications();
  return (
    <>
      <div data-testid="notes">{JSON.stringify(notifications)}</div>
      <div data-testid="err">{error?.toString() || ''}</div>
      <button data-testid="refetch" onClick={() => refetch()}>refetch</button>
      <button data-testid="del" onClick={async () => await deleteNotification('1')}>del</button>
    </>
  );
}

describe('useNotifications', () => {
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

  it('loads notifications', async () => {
    const data = [{ id: '1', message: 'Hi' }];
    mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve(data) } as any);

    render(wrapper(<NotificationsWrapper />));
    await waitFor(() => expect(screen.getByTestId('notes').textContent).to.equal(JSON.stringify(data)));
    expect(screen.getByTestId('err').textContent).to.equal('');
  });

  it('handles error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('fail'));
    render(wrapper(<NotificationsWrapper />));
    await waitFor(() => expect(screen.getByTestId('err').textContent).not.to.equal(''));
    expect(screen.getByTestId('notes').textContent).to.equal('[]');
  });

  it('refetches and deletes', async () => {
    const d1 = [{ id: '1', message: 'A' }];
    const d2 = [{ id: '2', message: 'B' }];
    mockFetch
      .mockResolvedValueOnce({ json: () => Promise.resolve(d1) } as any)
      .mockResolvedValueOnce({ json: () => Promise.resolve(d2) } as any);
    render(wrapper(<NotificationsWrapper />));
    await waitFor(() => expect(screen.getByTestId('notes').textContent).to.equal(JSON.stringify(d1)));
    fireEvent.click(screen.getByTestId('refetch'));
    await waitFor(() => expect(screen.getByTestId('notes').textContent).to.equal(JSON.stringify(d2)));

    // delete
    const d3: any[] = [];
    mockFetch
      .mockResolvedValueOnce({ ok: true } as any)
      .mockResolvedValueOnce({ json: () => Promise.resolve(d3) } as any);
    fireEvent.click(screen.getByTestId('del'));
    await waitFor(() => expect(screen.getByTestId('notes').textContent).to.equal(JSON.stringify(d3)));
  });
});

