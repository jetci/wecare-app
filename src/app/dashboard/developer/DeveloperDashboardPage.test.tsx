import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import React from 'react';
import { CacheStats, JobStats, DeploymentStats, SystemHealth, HealthPoint, Notification, Community, Patient } from '@/types/dashboard'
import { render, screen, fireEvent, waitFor, act, within, waitForElementToBeRemoved, cleanup, renderHook } from '@/app/dashboard/test-utils'

// placeholder for mocked user
let mockUser: any;
// mock replace method
const replaceMock = vi.fn();

// Mock useAuth from AuthContext
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: mockUser }),
}));
// Mock useRouter from next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

import DeveloperDashboardPage from './page';

describe('DeveloperDashboardPage access control', () => {
  beforeEach(() => {
    replaceMock.mockClear();
  });

  it('redirects and hides UI for wrong developer id', async () => {
    mockUser = { role: 'DEVELOPER', nationalId: 'WRONG_ID' };
    await act(async () => {
      render(<DeveloperDashboardPage />);
    });
    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('/dashboard');
    });
    expect(screen.queryByText(/Developer Dashboard Home/i)).to.be.null();
  });

  it('renders dashboard for correct developer id', async () => {
    mockUser = { role: 'DEVELOPER', nationalId: '3500200461028' };
    await act(async () => {
      render(<DeveloperDashboardPage />);
    });
    await waitFor(() => {
      expect(screen.getByText(/Developer Dashboard Home/i)).toBeInTheDocument();
    });
    expect(replaceMock).not.toHaveBeenCalled();
  });
});

