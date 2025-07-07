import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, act, within, waitForElementToBeRemoved, cleanup, renderHook } from '@/app/dashboard/test-utils';
import CommunityHistoryPage from './history/page';
import { useCommunityHistory } from '../../../hooks/useCommunityHistory';
import { useParams } from 'next/navigation';
import { vi } from 'vitest';

let pushMock: any;
// Mock useParams
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, replace: pushMock, prefetch: vi.fn(), refresh: vi.fn(), asPath: '/dashboard/community/history' }),
  usePathname: () => '/dashboard/community/history',
  useParams: vi.fn(),
}));
// Mock useCommunityHistory hook
vi.mock('../../../hooks/useCommunityHistory', () => ({ useCommunityHistory: vi.fn() }));

describe('CommunityHistoryPage', () => {
  const loadMoreMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useParams as any).mockReturnValue({ id: '123' });
  });

  it('shows spinner when loading', () => {
    (useCommunityHistory as any).mockReturnValue({ itemsList: [], isLoading: true, error: null, loadMore: loadMoreMock });
    renderWithProviders(<CommunityHistoryPage />);
    expect(screen.getAllByRole('status').length).toBeGreaterThan(0);
  });

  it('shows error message on error', () => {
    (useCommunityHistory as any).mockReturnValue({ itemsList: [], isLoading: false, error: 'fail', loadMore: loadMoreMock });
    renderWithProviders(<CommunityHistoryPage />);
    expect(screen.getByRole('alert')).toHaveTextContent('เกิดข้อผิดพลาดในการโหลดประวัติ');
  });

  it('renders list items, table rows, and load more button', () => {
    const items = [
      { id: '1', status: 'PENDING', date: '2025-06-01', event: 'E1', caretaker: 'C1' },
      { id: '2', status: 'COMPLETED', date: '2025-06-02', event: 'E2', caretaker: 'C2' }
    ];
    (useCommunityHistory as any).mockReturnValue({ itemsList: items, isLoading: false, error: null, loadMore: loadMoreMock });

    renderWithProviders(<CommunityHistoryPage />);
    const listItems = screen.getAllByTestId('history-item');
    expect(listItems).to.have.lengthOf(items.length);

    const rows = screen.getAllByRole('row');
    expect(rows).to.have.lengthOf(items.length + 1);

    fireEvent.click(screen.getByTestId('load-more'));
    expect(loadMoreMock).toHaveBeenCalled();
  });

  it('redirects non-COMMUNITY role to /dashboard', async () => {
    pushMock = vi.fn();
    // simulate hook with no data
    (useCommunityHistory as any).mockReturnValue({ itemsList: [], isLoading: false, error: null, loadMore: vi.fn() });
    renderWithProviders(<CommunityHistoryPage />, { role: 'GUEST', route: '/dashboard/community/history' });
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/dashboard'));
  });
});

