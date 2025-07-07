import '@testing-library/jest-dom/vitest';
import React from 'react';
import { CacheStats, JobStats, DeploymentStats, SystemHealth, HealthPoint, Notification, Community, Patient } from '@/types/dashboard'
import { render, screen, fireEvent, waitFor, act, within, waitForElementToBeRemoved, cleanup, renderHook } from '@/app/dashboard/test-utils'
import CommunityRequestPage from './page'

import { vi } from 'vitest';
const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, replace: pushMock, prefetch: vi.fn(), refresh: vi.fn(), asPath: '/dashboard/community/request' }),
  usePathname: () => '/dashboard/community/request'
}));










describe('CommunityRequestPage - RoleGuard', () => {
  
  it('renders content for COMMUNITY role', async () => {
    render(<CommunityRequestPage />, { role: 'COMMUNITY', route: '/dashboard/community/request' })
    expect(await screen.findByText('ขอความช่วยเหลือ')).toBeInTheDocument()
  })

  it('redirects non-COMMUNITY role to /dashboard', async () => {
    
    render(<CommunityRequestPage />, { role: 'GUEST', route: '/dashboard/community/request' });
    await waitFor(() => expect(window.location.pathname).to.equal('/dashboard'));
  })
})

