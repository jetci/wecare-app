import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act, within, waitForElementToBeRemoved, cleanup, renderHook } from '@/app/dashboard/test-utils';
import HealthOfficerDashboardPage from './page';

// Mock MapOverview
vi.mock('@/components/dashboard/MapOverview', () => ({ __esModule: true, default: () => <div data-testid="map-overview" /> }));
// Use real KpiCard (it accepts testId prop)
// Mock Modal to avoid portal issues
vi.mock('@/components/ui/Modal', () => ({ __esModule: true, Modal: ({ children }: any) => <div>{children}</div> }));

describe('HealthOfficerDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete (global as any).fetch;
  });

  it('renders spinner while loading patients', () => {
    global.fetch = vi.fn(() => new Promise(() => {})) as any;
    renderWithProviders(<HealthOfficerDashboardPage />, { role: 'HEALTH_OFFICER', route: '/dashboard/health-officer' });
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders error when fetch fails', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('fail'))) as any;
    renderWithProviders(<HealthOfficerDashboardPage />, { role: 'HEALTH_OFFICER', route: '/dashboard/health-officer' });
    await waitFor(() => {
      expect(screen.getByTestId('error-patients')).toBeInTheDocument();
    });
  });

  it('renders empty state when no patients', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ json: () => Promise.resolve({ patients: [] }) })) as any;
    renderWithProviders(<HealthOfficerDashboardPage />, { role: 'HEALTH_OFFICER', route: '/dashboard/health-officer' });
    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });
  });

  it('renders KPI cards and map when patients exist', async () => {
    const patients = [
      { id: 'p1', lat: 0, lng: 0, status: 'PENDING' },
      { id: 'p2', lat: 0, lng: 0, status: 'IN_CARE' },
      { id: 'p3', lat: 0, lng: 0, status: 'TRANSFERRED' },
      { id: 'p4', lat: 0, lng: 0, status: 'PENDING' }
    ];
    global.fetch = vi.fn(() => Promise.resolve({ json: () => Promise.resolve({ patients }) })) as any;
    renderWithProviders(<HealthOfficerDashboardPage />, { role: 'HEALTH_OFFICER', route: '/dashboard/health-officer' });
    await waitFor(() => {
      expect(screen.getByTestId('kpi-pending')).toHaveTextContent('2');
      expect(screen.getByTestId('kpi-in-care')).toHaveTextContent('1');
      expect(screen.getByTestId('kpi-transferred')).toHaveTextContent('1');
      expect(screen.getByTestId('map-overview')).toBeInTheDocument();
      expect(screen.getByTestId('broadcast-button')).toBeInTheDocument();
    });
  });
});
