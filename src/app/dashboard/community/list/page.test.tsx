import React from 'react';
import { CacheStats, JobStats, DeploymentStats, SystemHealth, HealthPoint, Notification, Community, Patient } from '@/types/dashboard'
import { render, screen, fireEvent, waitFor, act, within, waitForElementToBeRemoved, cleanup, renderHook } from '@/app/dashboard/test-utils'
import CommunityListPage from './page';
import { vi } from 'vitest';

// Mock SWR
const useSWRMock = vi.fn();
vi.mock('swr', () => ({
  __esModule: true,
  default: (key: string) => useSWRMock(key),
}));

describe('CommunityListPage', () => {
  const communities: Community[] = [
    { id: '1', name: 'Alpha', total: 10, inCare: 5, transferred: 2 },
    { id: '2', name: 'Beta', total: 8, inCare: 3, transferred: 1 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    window.history.pushState({}, '', '/dashboard/community/patients');
    // default: loading state
    useSWRMock.mockReturnValue({ data: undefined, isLoading: true, error: undefined });
  });

  it('shows loading then error states', async () => {
    const { rerender } = render(<CommunityListPage />, { role: 'COMMUNITY' });
    expect(await screen.findByTestId('table-loading')).toBeInTheDocument();

    useSWRMock.mockReturnValue({ data: undefined, isLoading: false, error: new Error('fail') });
    rerender(<CommunityListPage />);
    expect(await screen.findByTestId('table-error')).toBeInTheDocument();
  });

  it('renders data table', async () => {
    useSWRMock.mockReturnValue({ data: communities, isLoading: false, error: undefined });
    render(<CommunityListPage />, { role: 'COMMUNITY' });
    expect(await screen.findByTestId('data-table')).toBeInTheDocument();
    // headers
    expect(screen.getByText('ชื่อชุมชน')).toBeInTheDocument();
    expect(screen.getByText('ทั้งหมด')).toBeInTheDocument();
    // row data
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('handles pagination', async () => {
    useSWRMock.mockReturnValue({ data: communities, isLoading: false, error: undefined });
    render(<CommunityListPage />, { role: 'COMMUNITY' });
    await screen.findByTestId('data-table');
    const nextBtn = screen.getByTestId('next-page');
    fireEvent.click(nextBtn);
    await waitFor(() => expect(useSWRMock).toHaveBeenCalledWith(expect.stringContaining('page=2')));
  });

  it('supports search, filter, sort', async () => {
    useSWRMock.mockReturnValue({ data: communities, isLoading: false, error: undefined });
    render(<CommunityListPage />, { role: 'COMMUNITY' });
    await screen.findByTestId('data-table');

    // search
    fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'Alpha' } });
    await waitFor(() => expect(useSWRMock).toHaveBeenCalledWith(expect.stringContaining('search=Alpha')));

    // filter
    fireEvent.change(screen.getByTestId('filter-select'), { target: { value: 'IN_CARE' } });
    await waitFor(() => expect(useSWRMock).toHaveBeenCalledWith(expect.stringContaining('status=IN_CARE')));

    // sort
    fireEvent.click(screen.getAllByTestId('sort-button')[0]);
    await waitFor(() => expect(useSWRMock).toHaveBeenCalledWith(expect.stringContaining('sort=name_desc')));
  });
});
