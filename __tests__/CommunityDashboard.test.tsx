// Mock SWR with importOriginal to preserve SWRConfig and default hook
vi.mock('swr', async (importOriginal) => {
  const actual = await importOriginal<typeof import('swr')>();
  const swrMock = vi.fn((key: any) => {
    const profile = { user: { id: 'u1', firstName: 'John', lastName: 'Doe', nationalId: '1234', phone: '0800000000' } };
    const rides = [
      { id: 'r1', date: new Date().toISOString(), status: 'PENDING', driverName: 'X', rating: 4 },
      { id: 'r2', date: new Date().toISOString(), status: 'COMPLETED', driverName: 'Y', rating: 5 },
    ];
    const notifications = [
      { id: 'n1', message: 'Alert1' },
      { id: 'n2', message: 'Alert2' },
    ];
    if (key === '/api/auth/profile') return { data: profile, error: null };
    if (typeof key === 'string' && key.startsWith(`/api/rides?userId=${profile.user.id}`)) return { data: rides, error: null };
    if (key === '/api/notifications') return { data: notifications, error: null };
    if (typeof key === 'string' && key.startsWith('/api/patients')) return { data: [], error: null };
    return { data: undefined, error: null };
  });
  return {
    ...actual,
    SWRConfig: actual.SWRConfig,
    default: swrMock,
  };
});

// Mock Next.js routing before imports
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), refresh: vi.fn(), asPath: '/dashboard/community', pathname: '/dashboard/community' }),
  usePathname: () => '/dashboard/community',
}));

import { vi } from 'vitest';
import React from 'react';

// Bypass RoleGuard wrapper for tests
vi.mock('@/components/RoleGuard', () => ({ __esModule: true, default: ({ children }: any) => <>{children}</> }));

// Mock MapOverview to avoid Google Maps dependency (use distinct testId)
vi.mock('@/components/dashboard/MapOverview', () => ({
  __esModule: true,
  default: () => <div data-testid="map-overview">Mock Map</div>,
}));

import { renderWithProviders, fireEvent, waitFor, screen } from '../src/app/dashboard/test-utils';
import CommunityDashboardPage from '../src/app/dashboard/community/page';
import MapOverview from '../src/components/dashboard/MapOverview';

// Mock Next.js Link
vi.mock('next/link', () => {
  const React = require('react');
  return { default: ({ href, children, ...props }: any) => React.createElement('a', { href, ...props }, children) };
});

// Mock dynamic components and forms
vi.mock('next/dynamic', () => {
  const React = require('react');
  return {
    default: (_importFn: any, _options?: any) => {
      // Provide a dummy component for dynamic imports
      return (props: any) => React.createElement('div', { 'data-testid': 'mapoverview' }, props.children);
    },
  };
});
vi.mock('../src/components/ui/Modal', () => {
  const React = require('react');
  return { Modal: ({ open, onClose, children }: any) => React.createElement('div', { 'data-testid': 'modal', style: { display: open ? 'block' : 'none' } }, children) };
});
vi.mock('../src/components/forms/RideForm', () => {
  const React = require('react');
  return { RideForm: ({ onSuccess }: any) => React.createElement('button', { onClick: onSuccess }, 'SubmitRide') };
});

// Mock user role for RoleGuard
beforeAll(() => {
  localStorage.setItem('userRole', 'community');
});

// Set community role and prevent navigation errors before each test
beforeEach(() => {
  localStorage.setItem('userRole', 'COMMUNITY');
  Object.defineProperty(window, 'location', { value: { assign: vi.fn() }, writable: true });
});

afterAll(() => {
  localStorage.clear();
});

describe('CommunityDashboardPage', () => {
  it('renders KpiCards, MapOverview and RideTable with mock rides', () => {
    renderWithProviders(<CommunityDashboardPage />, { role: 'COMMUNITY', route: '/dashboard/community' });
    expect(screen.getByTestId('kpi-pending')).toHaveTextContent('1');
    expect(screen.getByTestId('kpi-in-progress')).toHaveTextContent('0');
    expect(screen.getByTestId('kpi-completed')).toHaveTextContent('1');
    expect(screen.getByTestId('map-overview-wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('map-overview')).toBeInTheDocument();
    expect(screen.getByTestId('ride-table')).toBeInTheDocument();
    // mock rides have id 'r1' and 'r2'
    expect(screen.getByTestId('ride-row-r1')).toBeInTheDocument();
    expect(screen.getByTestId('ride-row-r2')).toBeInTheDocument();
  });
});

// Integration test: MapOverview fallback UI (use real component)
vi.unmock('@/components/dashboard/MapOverview');
const { default: ActualMapOverview } = require('../src/components/dashboard/MapOverview');
describe('MapOverview fallback UI', () => {
  it('shows alert when API key is missing', () => {
    const originalKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const { getByRole, getByTestId } = renderWithProviders(<ActualMapOverview locations={[]} />);
    expect(getByRole('alert', { name: /ไม่สามารถโหลดแผนที่/i })).toBeInTheDocument();
    expect(getByTestId('map-error')).toBeInTheDocument();
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = originalKey;
  });
});
