import React from 'react';
import { render } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import PermissionGuard from '@/components/auth/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

// Mock useAuth
vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));
// Mock next/navigation
const pushMock = vi.fn();
const replaceMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
  usePathname: () => '/current-path',
}));

describe('PermissionGuard (AuthGuard)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to /login when not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({ loading: false, isAuthenticated: false });
    render(
      <PermissionGuard>
        <div>Private Content</div>
      </PermissionGuard>
    );
    expect(pushMock).toHaveBeenCalled();
    expect(pushMock.mock.calls[0][0]).toContain('/login');
  });

  it('renders children when authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({ loading: false, isAuthenticated: true });
    const { getByText } = render(
      <PermissionGuard>
        <div>Private Content</div>
      </PermissionGuard>
    );
    expect(pushMock).not.toHaveBeenCalled();
    expect(getByText('Private Content')).toBeInTheDocument();
  });

  it('allows dev override when NEXT_PUBLIC_DEV_USER_ID matches', () => {
    process.env.NEXT_PUBLIC_DEV_USER_ID = 'dev-123';
    (useAuth as jest.Mock).mockReturnValue({
      loading: false,
      isAuthenticated: false,
      user: { userId: 'dev-123' },
    });
    const { getByText } = render(
      <PermissionGuard>
        <div>Private Content</div>
      </PermissionGuard>
    );
    expect(pushMock).not.toHaveBeenCalled();
    expect(getByText('Private Content')).toBeInTheDocument();
  });
});
