import React from 'react'
import { CacheStats, JobStats, DeploymentStats, SystemHealth, HealthPoint, Notification, Community, Patient } from '@/types/dashboard'
import { render, screen, fireEvent, waitFor, act, within, waitForElementToBeRemoved, cleanup, renderHook } from '@/app/dashboard/test-utils'
import { vi } from 'vitest'
// Mock Next.js useRouter with shared mockPush for redirect assertions
const mockPush = vi.fn()
vi.mock('next/navigation', async () => {
  const actual = await vi.importActual<typeof import('next/navigation')>('next/navigation')
  return {
    __esModule: true,
    ...actual,
    useRouter: () => ({
      push: mockPush,
      replace: vi.fn(),
      prefetch: vi.fn(),
      refresh: vi.fn(),
      forward: vi.fn(),
      back: vi.fn(),
      asPath: window.location.pathname + window.location.search,
      pathname: window.location.pathname,
    }),
    usePathname: () => window.location.pathname,
    useParams: () => ({}),
    useSearchParams: () => new URLSearchParams(window.location.search),
  }
})

// Mock confirmPatientData for all tests
const mockConfirm = vi.fn()
vi.mock('@/lib/confirmPatientData', () => ({
  __esModule: true,
  confirmPatientData: (...args: any[]) => mockConfirm(...args),
}))

import * as AuthContext from '@/context/AuthContext'
import PatientReviewPage from './page'
// react-hot-toast is mocked globally in vitest.setup.ts

describe('PatientReviewPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockConfirm.mockReset()
    window.alert = vi.fn()
    global.fetch = vi.fn().mockResolvedValue({ ok: true, text: async () => '' })
  })

  it('renders patient data from params', () => {
    const route = '/dashboard/community/patients/review?prefix=นาย&firstName=Somchai&lastName=Sukjai'
    const { container } = render(<PatientReviewPage />, { role: 'COMMUNITY', route })
    expect(screen.getByText(/Somchai/)).toBeInTheDocument()
    expect(screen.getByText(/Sukjai/)).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('alerts when no patientGroup and prevents submission', async () => {
    const route = '/dashboard/community/patients/review?prefix=นาย&firstName=Somchai&lastName=Sukjai'
    render(<PatientReviewPage />, { role: 'COMMUNITY', route })
    fireEvent.click(screen.getByRole('button', { name: /ยืนยันและบันทึก/ }))
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('กรุณาเลือกกลุ่มผู้ป่วย'))
  })

  it('redirects on successful save', async () => {
    const route = '/dashboard/community/patients/review?prefix=นาย&firstName=Somchai&lastName=Sukjai&patientGroup=ผู้ป่วยติดเตียง'
    // mock confirmPatientData resolution
    mockConfirm.mockResolvedValueOnce(new Response('', { status: 200 }))
    render(<PatientReviewPage />, { role: 'COMMUNITY', route })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /ยืนยันและบันทึก/ }))
    })
    console.log(mockPush.mock.calls)
    await waitFor(
      () => expect(mockPush).toHaveBeenCalledWith(expect.stringMatching(/\/dashboard\/community\/patients(\/new)?$/)),
      { timeout: 2000 }
    )
  })

  it('shows error message on failure', async () => {
    const route = '/dashboard/community/patients/review?prefix=นาย&firstName=Somchai&lastName=Sukjai&patientGroup=ผู้ป่วยติดเตียง'
    mockConfirm.mockResolvedValueOnce(new Response('Bad', { status: 500 }))
    render(<PatientReviewPage />, { role: 'COMMUNITY', route })
    fireEvent.click(screen.getByRole('button', { name: /ยืนยันและบันทึก/ }))
    expect(await screen.findByTestId('toast-error')).toBeInTheDocument()
  })

  it('redirects to new form if no params', async () => {
    const route = '/dashboard/community/patients/review'
    await act(async () => {
      render(<PatientReviewPage />, { role: 'COMMUNITY', route })
    })
    console.log(mockPush.mock.calls)
    await waitFor(
      () => expect(mockPush).toHaveBeenCalledWith(expect.stringMatching(/\/dashboard\/community\/patients(\/new)?$/)),
      { timeout: 2000 }
    )
  })

  it('redirects non-community users', async () => {
    const route = '/dashboard/community/patients/review?firstName=X'
    // Mock useAuth to return non-community role
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      role: 'ADMIN',
      isAuthenticated: true,
      setRole: vi.fn(),
      isAdmin: false,
      isGuest: false,
    })
    // Render without manual act to allow built-in effect flushing
    render(<PatientReviewPage />, { role: 'ADMIN', route })
    console.log('non-community mockPush calls:', mockPush.mock.calls)
    await waitFor(
      () => expect(mockPush).toHaveBeenCalledWith(expect.stringMatching(/\/dashboard\/community\/patients$/)),
      { timeout: 2000 }
    )
  })
})
