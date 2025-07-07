import '@testing-library/jest-dom/vitest';
import React from 'react';
import { vi } from 'vitest';
import useSWR from 'swr';
import { render, screen, fireEvent, waitFor, act, within, waitForElementToBeRemoved, cleanup, renderHook } from '@/app/dashboard/test-utils';
import DeveloperDashboardPage from './page';

// Mock SWR
vi.mock('swr', async () => {
  const actual = await vi.importActual<typeof import('swr')>('swr');
  return { __esModule: true, ...actual, default: vi.fn(), SWRConfig: actual.SWRConfig };
});
const useSWRMock = useSWR as unknown as ReturnType<typeof vi.fn>;

// Mock UI components
vi.mock('@/components/ui/Spinner', () => ({ __esModule: true, Spinner: () => <div data-testid="spinner" /> }));
vi.mock('@/components/dashboard/HealthChart', () => ({ __esModule: true, default: () => <div data-testid="health-chart" /> }));

describe('DeveloperDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSWRMock.mockReset();
  });

  it('renders spinner for each card when loading', () => {
    useSWRMock.mockReturnValue({ data: undefined, error: undefined, isLoading: true });
    renderWithProviders(<DeveloperDashboardPage />, { role: 'DEVELOPER', route: '/dashboard/developer' });
    expect(screen.getAllByTestId('spinner').length).toBeGreaterThanOrEqual(1);
  });

  it('renders health chart when data loaded', async () => {
    // mock sequence: health, history, errorLogs, recentLogs, apiStats, flags, jobs
    useSWRMock.mockReturnValueOnce({ data: undefined, error: null, isLoading: false }) // health
      .mockReturnValueOnce({ data: [], error: null, isLoading: false }) // history
      .mockReturnValue({ data: null, error: null, isLoading: false }); // others
    renderWithProviders(<DeveloperDashboardPage />, { role: 'DEVELOPER', route: '/dashboard/developer' });
    expect(screen.getByTestId('card-system-health')).toBeInTheDocument();
    expect(screen.getByTestId('health-chart')).toBeInTheDocument();
  });
});

