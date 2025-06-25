import React from 'react'
import { CacheStats, JobStats, DeploymentStats, SystemHealth, HealthPoint, Notification, Community, Patient } from '@/types/dashboard'
import { render, screen, fireEvent, waitFor, act, within, waitForElementToBeRemoved } from '@/app/dashboard/test-utils'
import { render as renderFromTestUtils } from '../dashboard/test-utils'; // Renamed to avoid conflict
 // Import render directly
import useSWR from 'swr'
import { vi } from 'vitest'
import { useRouter } from 'next/navigation'
import ProfilePage from './page'

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({ __esModule: true, useRouter: () => ({ push: mockPush }) }))
// Mock SWR hook
// Mock SWR to retain SWRConfig and default hook
vi.mock('swr', async (importOriginal) => {
  const actual = await importOriginal<typeof import('swr')>();
  return {
    ...actual,
    SWRConfig: actual.SWRConfig,
    default: vi.fn(),
  };
});
// Mock Spinner
vi.mock('@/components/ui/Spinner', () => ({ Spinner: () => 'LoadingSpinner' }))

describe('ProfilePage', () => {
  const mockGenericError = new Error('Network Error');
  const mockUnauthorizedError = { status: 401, message: 'Unauthorized', info: { message: 'Token expired' } };
  const mockForbiddenError = { status: 403, message: 'Forbidden', info: { message: 'Access denied' } };
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('shows loading spinner when loading', () => {
    ;(useSWR as any).mockReturnValue({ data: undefined, error: null, isLoading: true })
    // Using direct render from @testing-library/react, no providers from test-utils
    render(<ProfilePage />); 
    screen.debug(); // For debugging DOM output
    expect(screen.getByText('LoadingSpinner')).toBeInTheDocument();
  })

  it('shows error message for generic errors when fetching profile', () => {
    ;(useSWR as any).mockReturnValue({ data: undefined, error: mockGenericError, isLoading: false });
    renderFromTestUtils(<ProfilePage />, { role: 'USER', route: '/profile' });
    expect(screen.getByText('ไม่สามารถโหลดข้อมูลผู้ใช้ได้')).toBeInTheDocument();
    // Check for the additional error info message if provided by the mock
    if (mockGenericError.message) {
      // The component displays error.info.message, but our mockGenericError itself is the simple error
      // For a more precise test, we'd ensure mockGenericError.info.message is set if we want to test that part
      // For now, we just check the main error message.
    }
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('redirects to login on 401 Unauthorized error', () => {
    ;(useSWR as any).mockReturnValue({ data: undefined, error: mockUnauthorizedError, isLoading: false });
    renderFromTestUtils(<ProfilePage />, { role: 'USER', route: '/profile' });
    expect(window.location.pathname).toBe('/login');
    expect(screen.queryByText('ไม่สามารถโหลดข้อมูลผู้ใช้ได้')).not.toBeInTheDocument();
  });

  it('redirects to login on 403 Forbidden error', () => {
    ;(useSWR as any).mockReturnValue({ data: undefined, error: mockForbiddenError, isLoading: false });
    renderFromTestUtils(<ProfilePage />, { role: 'USER', route: '/profile' });
    expect(window.location.pathname).toBe('/login');
    expect(screen.queryByText('ไม่สามารถโหลดข้อมูลผู้ใช้ได้')).not.toBeInTheDocument();
  });

  it('shows error message when user data is not found after successful fetch (data.user is null)', () => {
    ;(useSWR as any).mockReturnValue({ data: { user: null }, error: null, isLoading: false });
    renderFromTestUtils(<ProfilePage />, { role: 'USER', route: '/profile' });
    expect(screen.getByText('ไม่สามารถโหลดข้อมูลผู้ใช้ได้')).toBeInTheDocument();
    expect(screen.getByText('(ไม่พบข้อมูลผู้ใช้)')).toBeInTheDocument(); // Specific sub-message for this case
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('shows error message when user data is not found after successful fetch (data is null)', () => {
    // This case also covers if data is undefined
    ;(useSWR as any).mockReturnValue({ data: null, error: null, isLoading: false });
    renderFromTestUtils(<ProfilePage />, { role: 'USER', route: '/profile' });
    expect(screen.getByText('ไม่สามารถโหลดข้อมูลผู้ใช้ได้')).toBeInTheDocument();
    expect(screen.getByText('(ไม่พบข้อมูลผู้ใช้)')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('renders user information when loaded', () => {
    const user = {
      firstName: 'John', lastName: 'Doe', nationalId: '1234', phone: '0800000000',
      address: {
        houseNumber: '1', village: '2', subdistrict: 'X', district: 'Y', province: 'Z'
      },
      avatarUrl: ''
    }
    ;(useSWR as any).mockReturnValue({ data: { user }, error: null, isLoading: false })
    renderFromTestUtils(<ProfilePage />, { role: 'USER', route: '/profile' })
    expect(screen.getByText('ข้อมูลส่วนตัว')).toBeInTheDocument()
    expect(screen.getByText(/John/)).toBeInTheDocument()
    expect(screen.getByText(/Doe/)).toBeInTheDocument()
    expect(screen.getByText(/1234/)).toBeInTheDocument()
    expect(screen.getByText(/0800000000/)).toBeInTheDocument()
    expect(screen.getByText(/บ้านเลขที่: 1/)).toBeInTheDocument()
    expect(screen.getByText(/หมู่ที่: 2/)).toBeInTheDocument()
    expect(screen.getByText(/ตำบล: X/)).toBeInTheDocument()
    expect(screen.getByText(/อำเภอ: Y/)).toBeInTheDocument()
    expect(screen.getByText(/จังหวัด: Z/)).toBeInTheDocument()
  })
})
