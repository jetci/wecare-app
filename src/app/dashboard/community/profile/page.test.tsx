import React from 'react';
import { CacheStats, JobStats, DeploymentStats, SystemHealth, HealthPoint, Notification, Community, Patient } from '@/types/dashboard'
import { render, screen, fireEvent, waitFor, act, within, waitForElementToBeRemoved, cleanup, renderHook } from '@/app/dashboard/test-utils'
import { vi } from 'vitest';
import * as nextNavigation from 'next/navigation';
import { Role } from '@/types/roles';
import CommunityProfilePage from './page';

describe('CommunityProfilePage – RoleGuard', () => {
  const replaceMock = vi.fn();

  beforeEach(() => {
    vi.spyOn(nextNavigation, 'useRouter').mockReturnValue({
      push: vi.fn(),
      replace: replaceMock,
      prefetch: vi.fn(),
      refresh: vi.fn(),
    } as any);
    vi.spyOn(nextNavigation, 'usePathname').mockReturnValue('/dashboard/community/profile');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders heading for COMMUNITY role', async () => {
    render(<CommunityProfilePage />, {
      role: Role.COMMUNITY,
      route: '/dashboard/community/profile',
    });
    expect(await screen.findByText('โปรไฟล์ชุมชน')).toBeInTheDocument();
  });

  it('redirects non-COMMUNITY role to /dashboard', async () => {
    render(<CommunityProfilePage />, {
      role: Role.DRIVER,
      route: '/dashboard/community/profile',
    });
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith('/dashboard'));
  });
});
