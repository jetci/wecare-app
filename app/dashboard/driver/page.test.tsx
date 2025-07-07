import '@testing-library/jest-dom/vitest';
/// <reference types="vitest" />
import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act, within, waitForElementToBeRemoved, cleanup, renderHook } from '@/app/dashboard/test-utils'
import DriverDashboardPage from './page';
// Bypass RoleGuard for tests
vi.mock('@/components/RoleGuard', () => ({ __esModule: true, default: ({ children }: any) => children }));
import React from 'react'
import { CacheStats, JobStats, DeploymentStats, SystemHealth, HealthPoint, Notification, Community, Patient } from '@/types/dashboard'
import useSWR from 'swr'
import { Spinner } from '@/components/ui/Spinner'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { Mock } from 'vitest'

// Partial mock SWR preserving SWRConfig
vi.mock('swr', async () => {
  const actual = await vi.importActual<typeof import('swr')>('swr')
  return {
    __esModule: true,
    ...actual,
    default: vi.fn(),
    SWRConfig: actual.SWRConfig,
  }
})
// Mock Spinner
vi.mock('@/components/ui/Spinner', () => ({ __esModule: true, Spinner: () => <div data-testid="spinner">LoadingSpinner</div> }))
// Mock KpiCard to use testId prop
vi.mock('@/components/dashboard/KpiCard', () => ({
  __esModule: true,
  KpiCard: ({ title, count, testId }: any) => <div data-testid={testId}>{title}:{count}</div>,
}))

// Use vi.Mock for SWR
const mockedSWR = useSWR as unknown as Mock

// Stub ResizeObserver for jsdom
global.ResizeObserver = class { observe(){}; unobserve(){}; disconnect(){} }

describe('DriverDashboardPage', () => {
  // Reset mocks and SWR before each test
  beforeEach(() => {
    vi.clearAllMocks()
    mockedSWR.mockReset()
  })

  it('renders spinner when loading profile or rides', () => {
    // profile loading
    mockedSWR.mockReturnValueOnce({ data: null, error: null, isLoading: true })
    // rides stub
    mockedSWR.mockReturnValueOnce({ data: null, error: null, isLoading: false })

    render(<DriverDashboardPage />, { role: 'driver', route: '/dashboard/driver' })
    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })

  it('renders assigned rides and counts', () => {
    // profile
    mockedSWR.mockReturnValueOnce({ data: { user: { id: 'd1' } }, error: null, isLoading: false })
    // rides assigned
    const ridesArray = [
      { id: 'r1', date: '2025-01-01T00:00:00Z', status: 'PENDING', userName: 'U1' },
      { id: 'r2', date: '2025-01-02T00:00:00Z', status: 'COMPLETED', userName: 'U2' },
    ]
    mockedSWR.mockReturnValueOnce({ data: { rides: ridesArray }, error: null, isLoading: false })

    render(<DriverDashboardPage />, { role: 'driver', route: '/dashboard/driver' })
    // counts: 1 pending,0 inProgress,1 completed
    expect(screen.getByTestId('kpi-pending')).toHaveTextContent('รอรับงาน:1')
    expect(screen.getByTestId('kpi-in-progress')).toHaveTextContent('กำลังดำเนินการ:0')
    expect(screen.getByTestId('kpi-completed')).toHaveTextContent('เสร็จสิ้น:1')
    // table rows
    expect(screen.getByTestId('ride-row-r1')).toBeInTheDocument()
    expect(screen.getByTestId('ride-row-r2')).toBeInTheDocument()
  })

  it('renders empty state when no assigned rides', () => {
    // profile
    mockedSWR.mockReturnValueOnce({ data: { user: { id: 'd1' } }, error: null, isLoading: false })
    // rides empty
    mockedSWR.mockReturnValueOnce({ data: { rides: [] }, error: null, isLoading: false })

    render(<DriverDashboardPage />, { role: 'driver', route: '/dashboard/driver' })
    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
  })
})

