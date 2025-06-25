import React from 'react'
import { CacheStats, JobStats, DeploymentStats, SystemHealth, HealthPoint, Notification, Community, Patient } from '@/types/dashboard'
import { render, screen, fireEvent, waitFor, act, within, waitForElementToBeRemoved, cleanup, renderHook } from '@/app/dashboard/test-utils'
import useSWR from 'swr'
import { vi } from 'vitest';
let pushMock: any;
// Mock next/navigation push
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, replace: pushMock, prefetch: vi.fn(), refresh: vi.fn(), asPath: '/dashboard/community/map' }),
  usePathname: () => '/dashboard/community/map',
  useSearchParams: () => new URLSearchParams(),
}));

// Import after router mock
import CommunityMapPage from './page'

// Mock SWR with importOriginal to preserve SWRConfig and default hook
vi.mock('swr', async (importOriginal) => {
  const actual = await importOriginal<typeof import('swr')>();
  const mockUseSWR = vi.fn();
  return {
    ...actual,
    SWRConfig: actual.SWRConfig,
    default: mockUseSWR,
  };
});
const useSWRMock = (vi.importMock as any).default as unknown as { mockReturnValue: (arg: any) => void; mockReset: () => void }

// Mock Map component to render markers
vi.mock('../../../../components/dashboard/community/Map', () => {
  const React = require('react')
  return {
    __esModule: true,
    default: ({ locations, onMarkerClick }: any) => (
      <div data-testid="map">
        {locations.map((loc: any) => (
          <button
            key={loc.id}
            data-testid={`marker-${loc.id}`}
            onClick={() => onMarkerClick(loc)}
          >{loc.name}</button>
        ))}
      </div>
    )
  }
})

describe('CommunityMapPage', () => {
  beforeEach(() => {
    useSWRMock.mockReset()
  })

  it('shows loading spinner for COMMUNITY role', async () => {
    useSWRMock.mockReturnValue({ data: undefined, error: null, isLoading: true });
    render(<CommunityMapPage params={{ communityId: '1' }} />, { role: 'COMMUNITY', route: '/dashboard/community/map' });
    const spinner = await screen.findByTestId('loading-spinner');
    expect(spinner).toBeInTheDocument();
  })

  it('shows error alert for COMMUNITY role', async () => {
    useSWRMock.mockReturnValue({ data: undefined, error: new Error(), isLoading: false });
    render(<CommunityMapPage params={{ communityId: '1' }} />, { role: 'COMMUNITY', route: '/dashboard/community/map' });
    const alert = await screen.findByRole('alert');
    expect(alert).toBeInTheDocument();
  })

  it('renders map and markers for COMMUNITY role', async () => {
    const locs = [
      { id: '1', name: 'A', lat: 1, lng: 2, details: 'D1' },
      { id: '2', name: 'B', lat: 3, lng: 4, details: 'D2' }
    ];
    useSWRMock.mockReturnValue({ data: locs, error: null, isLoading: false });
    render(<CommunityMapPage params={{ communityId: '1' }} />, { role: 'COMMUNITY', route: '/dashboard/community/map' });
    const map = await screen.findByTestId('map');
    expect(map).toBeInTheDocument();
    for (const loc of locs) {
      const marker = await screen.findByTestId(`marker-${loc.id}`);
      expect(marker).toBeInTheDocument();
    }
  })

  it('displays location detail on marker click for COMMUNITY role', async () => {
    const locs = [{ id: '1', name: 'A', lat: 1, lng: 2, details: 'Details A' }];
    useSWRMock.mockReturnValue({ data: locs, error: null, isLoading: false });
    render(<CommunityMapPage params={{ communityId: '1' }} />, { role: 'COMMUNITY', route: '/dashboard/community/map' });
    const marker = await screen.findByTestId('marker-1');
    fireEvent.click(marker);
    const detail = await screen.findByTestId('location-detail');
    expect(detail).toHaveTextContent('A');
    expect(detail).toHaveTextContent('Details A');
  })

  it('redirects non-COMMUNITY role to /dashboard', async () => {
    useSWRMock.mockReturnValue({ data: [], error: null, isLoading: false });
    pushMock = vi.fn();
    render(<CommunityMapPage params={{ communityId: '1' }} />, { role: 'GUEST', route: '/dashboard/community/map' });
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/dashboard'));
  })

  it('redirects non-COMMUNITY role to /dashboard', async () => {
    useSWRMock.mockReturnValue({ data: [], error: null, isLoading: false });
    pushMock = vi.fn();
    render(<CommunityMapPage params={{ communityId: '1' }} />, { role: 'DRIVER', route: '/dashboard/community/map' });
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/dashboard'));
  })
})
