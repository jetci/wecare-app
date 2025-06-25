import React from 'react';
import { render, screen, fireEvent, waitFor, act, within, waitForElementToBeRemoved, cleanup, renderHook } from '@/app/dashboard/test-utils';
import CommunityDashboardPage from './page';
import { useCreateRide as mockUseCreateRide } from '../../../hooks/useCreateRide';
import { useRides as mockUseRides } from '../../../hooks/useRides';
import { useProfile as mockUseProfile } from '../../../hooks/useProfile';

// Bypass RoleGuard for CommunityDashboardPage
vi.mock('@/components/RoleGuard', () => ({ __esModule: true, default: ({ children }: any) => children }));

// Mock hooks
vi.mock('../../../hooks/useProfile', () => ({ useProfile: () => ({ profile: { id: '1' }, isLoading: false, error: null }) }));
vi.mock('../../../hooks/useRides', () => ({ useRides: () => ({ rides: [], isLoading: false, error: null }) }));

const createRideFn = vi.fn();
vi.mock('../../../hooks/useCreateRide', () => ({ useCreateRide: () => ({ createRide: createRideFn, loading: false, error: null }) }));

describe('Request Modal in CommunityDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    renderWithProviders(<CommunityDashboardPage />, { role: 'COMMUNITY', route: '/dashboard/community' });
  });

  it('opens modal on New Request click', () => {
    expect(screen.queryByTestId('request-origin')).toBeNull();
    fireEvent.click(screen.getByTestId('new-request-btn'));
    expect(screen.getByTestId('request-origin')).toBeInTheDocument();
  });

  it('shows validation error when fields empty', () => {
    fireEvent.click(screen.getByTestId('new-request-btn'));
    fireEvent.click(screen.getByTestId('request-submit'));
    expect(screen.getByTestId('request-validation-error')).toHaveTextContent('Both fields are required');
  });

  it('calls createRide and closes modal on successful submit', async () => {
    fireEvent.click(screen.getByTestId('new-request-btn'));
    fireEvent.change(screen.getByTestId('request-origin'), { target: { value: 'Loc A' } });
    fireEvent.change(screen.getByTestId('request-desc'), { target: { value: 'Desc A' } });
    fireEvent.click(screen.getByTestId('request-submit'));
    expect(createRideFn).toHaveBeenCalledWith({ origin: 'Loc A', description: 'Desc A' });
    await waitFor(() => {
      expect(screen.queryByTestId('request-origin')).toBeNull();
    });
  });
});
