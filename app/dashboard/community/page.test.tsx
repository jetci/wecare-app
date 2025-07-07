import '@testing-library/jest-dom/vitest';
/// <reference types="vitest" />
import { vi, Mock } from 'vitest';

// Partial mock SWR preserving SWRConfig
vi.mock('swr', async () => {
  const actual = await vi.importActual<typeof import('swr')>('swr');
  return {
    __esModule: true,
    ...actual,
    default: vi.fn(),
    SWRConfig: actual.SWRConfig,
  };
});

// Mock Spinner to render identifiable text
vi.mock('../../../components/ui/Spinner', () => ({ __esModule: true, Spinner: () => <div>LoadingSpinner</div> }));
// Mock RideForm to render identifiable element
vi.mock('../../../components/forms/RideForm', () => ({ __esModule: true, RideForm: () => <div>MockRideForm</div> }));
// Mock MapOverview to avoid Google Maps API key error
vi.mock('../../../components/dashboard/MapOverview', () => ({ __esModule: true, default: () => <div>MockMapOverview</div> }));

import React from 'react';
import { CacheStats, JobStats, DeploymentStats, SystemHealth, HealthPoint, Notification, Community, Patient } from '@/types/dashboard'
import { render, screen, fireEvent, waitFor, act, within, waitForElementToBeRemoved, cleanup, renderHook } from '@/app/dashboard/test-utils'
import CommunityDashboardPage from './page';
import useSWR from 'swr';
import { SWRConfig } from 'swr';

// Stub ResizeObserver for jsdom environment
global.ResizeObserver = class { observe(){}; unobserve(){}; disconnect(){} };

// Typed SWR mock
const useSWRMock = useSWR as unknown as Mock;

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  useSWRMock.mockReset();
});

describe('CommunityDashboardPage', () => {
  it('แสดง Spinner เมื่อยังโหลดข้อมูล', async () => {
    useSWRMock.mockReturnValue({ data: null, error: null, isLoading: true });
    render(
      <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map(), errorRetryCount: 0 }}>
        <CommunityDashboardPage />
      </SWRConfig>,
      { role: 'COMMUNITY', route: '/dashboard/community' }
    );
    expect(await screen.findByText('LoadingSpinner')).toBeInTheDocument();
  })

  it('แสดงข้อความ error เมื่อ fetch ข้อมูลล้มเหลว', async () => {
    // profile error
    useSWRMock.mockReturnValueOnce({ data: null, error: true, isLoading: false })
    // rides, notifications, patients succeed
    useSWRMock.mockReturnValue({ data: [], error: null, isLoading: false })
    render(
      <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map(), errorRetryCount: 0 }}>
        <CommunityDashboardPage />
      </SWRConfig>,
      { role: 'COMMUNITY', route: '/dashboard/community' }
    );
    expect(await screen.findByText((content: string) => content.includes('เกิดข้อผิดพลาด'))).toBeInTheDocument()
  })

  it('แสดงข้อมูลเมื่อ fetch สำเร็จ', async () => {
    // profile
    useSWRMock.mockReturnValueOnce({ data: { user: { id: 'u1', firstName: 'A', lastName: 'B', nationalId: 'n', phone: 'p' } }, error: null, isLoading: false })
    // rides
    useSWRMock.mockReturnValueOnce({ data: [{ id: 'r1', status: 'PENDING' }], error: null, isLoading: false })
    // notifications
    useSWRMock.mockReturnValueOnce({ data: [{ id: 'n1', message: 'msg' }], error: null, isLoading: false })
    // patients
    useSWRMock.mockReturnValueOnce({ data: { patients: [{ id: 'p1', firstName: 'FN', lastName: 'LN', age: 10 }] }, error: null, isLoading: false })

    render(
      <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map(), errorRetryCount: 0 }}>
        <CommunityDashboardPage />
      </SWRConfig>,
      { role: 'COMMUNITY', route: '/dashboard/community' }
    );
    // pending count = 1
    expect(await screen.findByText('1')).toBeInTheDocument()
    // ผู้ป่วย: ตรวจสอบชื่อและอายุในข้อความใดๆ ในหน้าจอ
    expect(
      await screen.findByText((content: string) =>
        content.includes('FN') && content.includes('LN') && content.includes('10')
      )
    ).toBeInTheDocument()
    // notification
    expect(await screen.findByText('msg')).toBeInTheDocument()
  })

  it('แสดง counts ทั้งหมด (pending, inProgress, completed)', async () => {
    // profile
    useSWRMock.mockReturnValueOnce({ data: { user: { id: 'u1', firstName: 'A', lastName: 'B', nationalId: 'n', phone: 'p' } }, error: null, isLoading: false })
    // rides: 2 pending,1 inProgress,1 completed
    useSWRMock.mockReturnValueOnce({ data: [
      { id: 'r1', status: 'PENDING' },
      { id: 'r2', status: 'PENDING' },
      { id: 'r3', status: 'IN_PROGRESS' },
      { id: 'r4', status: 'COMPLETED' }
    ], error: null, isLoading: false })
    // notifications
    useSWRMock.mockReturnValueOnce({ data: [], error: null, isLoading: false })
    // patients
    useSWRMock.mockReturnValueOnce({ data: [], error: null, isLoading: false })

    render(
      <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map(), errorRetryCount: 0 }}>
        <CommunityDashboardPage />
      </SWRConfig>,
      { role: 'COMMUNITY', route: '/dashboard/community' }
    );
    expect(await screen.findByText('2')).toBeInTheDocument()
    const ones = await screen.findAllByText('1')
    expect(ones).to.have.lengthOf(2)
  })

  it('แสดงตารางประวัติการจอง', async () => {
    // profile
    useSWRMock.mockReturnValueOnce({ data: { user: { id: 'u1' } }, error: null, isLoading: false })
    // rides history
    useSWRMock.mockReturnValueOnce({ data: [
      { id: 'r1', date: '2025-01-01T00:00:00Z', status: 'COMPLETED', driverName: 'DR', rating: 5 }
    ], error: null, isLoading: false })
    // notifications
    useSWRMock.mockReturnValueOnce({ data: [], error: null, isLoading: false })
    // patients
    useSWRMock.mockReturnValueOnce({ data: [], error: null, isLoading: false })

    render(
      <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map(), errorRetryCount: 0 }}>
        <CommunityDashboardPage />
      </SWRConfig>,
      { role: 'COMMUNITY', route: '/dashboard/community' }
    );
    // check driver and rating
    expect(await screen.findByText('DR')).toBeInTheDocument()
    expect(await screen.findByText('5')).toBeInTheDocument()
  })

  it('เปิด modal และแสดง RideForm เมื่อคลิกปุ่ม ขอจองรถ', async () => {
    // mock SWR by key for stability
    useSWRMock.mockImplementation((key: string) => {
      if (key === '/api/auth/profile') return { data: { user: { id: 'u1' } }, error: null, isLoading: false };
      if (key.startsWith('/api/rides')) return { data: [], error: null, isLoading: false };
      if (key === '/api/notifications') return { data: [{ id: 'n1', message: 'notif' }], error: null, isLoading: false };
      if (key.startsWith('/api/patients')) return { data: [], error: null, isLoading: false };
      return { data: null, error: null, isLoading: false };
    });

    render(
      <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map(), errorRetryCount: 0 }}>
        <CommunityDashboardPage />
      </SWRConfig>,
      { role: 'COMMUNITY', route: '/dashboard/community' }
    );
    fireEvent.click(await screen.findByText('ขอจองรถ'))
    expect(await screen.findByText('MockRideForm')).toBeInTheDocument()
  })

  it('แสดง empty state เมื่อไม่มีผู้ป่วย', async () => {
    // profile
    useSWRMock.mockReturnValueOnce({ data: { user: { id: 'u1' } }, error: null, isLoading: false })
    // rides
    useSWRMock.mockReturnValueOnce({ data: [], error: null, isLoading: false })
    // notifications
    useSWRMock.mockReturnValueOnce({ data: [], error: null, isLoading: false })
    // patients empty
    useSWRMock.mockReturnValueOnce({ data: [], error: null, isLoading: false })

    render(
      <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map(), errorRetryCount: 0 }}>
        <CommunityDashboardPage />
      </SWRConfig>,
      { role: 'COMMUNITY', route: '/dashboard/community' }
    );
    expect(await screen.findByText('ยังไม่มีผู้ป่วยในความดูแล')).toBeInTheDocument()
  })
})

