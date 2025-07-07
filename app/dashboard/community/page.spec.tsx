import '@testing-library/jest-dom/vitest';
import React from 'react';
import { vi } from 'vitest';
import useSWR from 'swr';
import { render, screen, fireEvent, waitFor, act, within, waitForElementToBeRemoved, cleanup, renderHook } from '@/app/dashboard/test-utils';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import CommunityDashboardPage from './page';
import * as ProfileHook from '../../../hooks/useProfile';
import * as RidesHook from '../../../hooks/useRides';

// Mock createRide hook
const mockCreateRide = vi.fn();
vi.mock('../../../hooks/useCreateRide', () => ({ __esModule: true, useCreateRide: () => ({ createRide: mockCreateRide, loading: false, error: null }) }));

// Mock custom hooks to bypass SWR for profile and rides
vi.mock('../../../hooks/useProfile', () => ({ __esModule: true, useProfile: () => ({ profile: { id: 'u1' }, isLoading: false, error: null }) }));
vi.mock('../../../hooks/useRides', () => ({ __esModule: true, useRides: () => ({ rides: [], isLoading: false, error: null }) }));

// Mock UI components
vi.mock('../../../components/ui/Spinner', () => ({ __esModule: true, Spinner: () => <div data-testid="spinner" /> }));
vi.mock('../../../components/dashboard/KpiCard', () => ({ __esModule: true, KpiCard: ({ testId, count }: any) => <div data-testid={testId}>{count}</div> }));
vi.mock('../../../components/dashboard/RideTable', () => ({
  __esModule: true,
  default: ({ rides }: any) => (
    <>{rides.map((r: any) => <div key={r.id} data-testid={`ride-row-${r.id}`} />)}</>
  )
}));

describe('CommunityDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders spinner when loading', () => {
    // simulate loading state via hooks
    vi.spyOn(ProfileHook, 'useProfile').mockReturnValue({ profile: null, isLoading: true, error: null } as any);
    vi.spyOn(RidesHook, 'useRides').mockReturnValue({ rides: [], isLoading: false, error: null } as any);
    renderWithProviders(<CommunityDashboardPage />, { role: 'COMMUNITY', route: '/dashboard/community' });
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders KPIs and ride table when data loaded', async () => {
    // simulate loaded profile and rides
    vi.spyOn(ProfileHook, 'useProfile').mockReturnValue({ profile: { id: 'u1' }, isLoading: false, error: null } as any);
    const rides = [
      { id: 'r1', status: 'PENDING', date: '2025-01-01T00:00:00Z' },
      { id: 'r2', status: 'COMPLETED', date: '2025-01-02T00:00:00Z' }
    ];
    vi.spyOn(RidesHook, 'useRides').mockReturnValue({ rides, isLoading: false, error: null } as any);
    renderWithProviders(<CommunityDashboardPage />, { role: 'COMMUNITY', route: '/dashboard/community' });
    await waitFor(() => {
      expect(screen.getByTestId('kpi-pending')).toHaveTextContent('1');
      expect(screen.getByTestId('kpi-in-progress')).toHaveTextContent('0');
      expect(screen.getByTestId('kpi-completed')).toHaveTextContent('1');
      expect(screen.getByTestId('ride-row-r1')).toBeInTheDocument();
      expect(screen.getByTestId('ride-row-r2')).toBeInTheDocument();
    });
  });

  it('renders empty state when no rides', async () => {
    // simulate profile loaded and no rides
    vi.spyOn(ProfileHook, 'useProfile').mockReturnValue({ profile: { id: 'u1' }, isLoading: false, error: null } as any);
    vi.spyOn(RidesHook, 'useRides').mockReturnValue({ rides: [], isLoading: false, error: null } as any);
    renderWithProviders(<CommunityDashboardPage />, { role: 'COMMUNITY', route: '/dashboard/community' });
    await waitFor(() => expect(screen.getByTestId('empty-state')).toBeInTheDocument());
  });

  it('opens modal and submits new request', async () => {
    // simulate useProfile and useRides
    vi.spyOn(ProfileHook, 'useProfile').mockReturnValue({ profile: { id: 'u1' }, isLoading: false, error: null } as any);
    vi.spyOn(RidesHook, 'useRides').mockReturnValue({ rides: [], isLoading: false, error: null } as any);
    renderWithProviders(<CommunityDashboardPage />, { role: 'COMMUNITY', route: '/dashboard/community' });
    // open modal
    fireEvent.click(screen.getByTestId('new-request-btn'));
    expect(screen.getByTestId('request-modal')).toBeInTheDocument();
    // enter origin and description and submit
    fireEvent.change(screen.getByTestId('request-origin'), { target: { value: 'Home' } });
    fireEvent.change(screen.getByTestId('request-desc'), { target: { value: 'Need help' } });
    fireEvent.click(screen.getByTestId('request-submit'));
    expect(mockCreateRide).toHaveBeenCalledWith({ origin: 'Home', description: 'Need help' });
    await waitFor(() => expect(screen.queryByTestId('request-modal')).to.be.null());
  });
});

