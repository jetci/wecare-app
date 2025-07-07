import '@testing-library/jest-dom/vitest';
import React from 'react';
import { CacheStats, JobStats, DeploymentStats, SystemHealth, HealthPoint, Notification, Community, Patient } from '@/types/dashboard'
import { render, screen, fireEvent, waitFor, act, within, waitForElementToBeRemoved, cleanup, renderHook } from '@/app/dashboard/test-utils'
import { vi } from 'vitest';
import useSWR from 'swr';

// Mock Recharts ResponsiveContainer to avoid zero size in jsdom
vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div style={{ width: 800, height: 600 }}>{children}</div>,
  };
});

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
const useSWRMock = useSWR as unknown as ReturnType<typeof vi.fn>;

// Removed unused exportCSV/exportPDF mocks
// Removed unused exportPDF import

// component under test
import AdminDashboardPage from './page';

// NOTE: test-utils handles RoleGuard, localStorage and navigation stubs
// stub ResizeObserver for jsdom
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
// Removed unused SWRConfig import

// Setup SWR mock per-key
beforeEach(() => {
  vi.clearAllMocks();
  // Default: no data for paths
  useSWRMock.mockImplementation(() => ({ data: undefined, error: undefined, isLoading: false }));
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('AdminDashboardPage Export', () => {
  const reports = { usersByGroup: [{ group: 'A', count: 10 }], pendingRequests: 5, totalRides: 20, weeklyTrends: [] };

  it('แสดงปุ่ม export เมื่อมี reports', async () => {
    useSWRMock.mockImplementation((key: string) => {
      if (key === '/api/reports') return { data: reports, error: undefined, isLoading: false };
      return { data: [], error: undefined, isLoading: false };
    });
    // render and wait for AuthProvider state
    await act(async () => {
      render(<AdminDashboardPage />, { role: 'ADMIN', route: '/dashboard/admin' });
    });
    // รอปุ่ม CSV ปรากฏ
    const csvBtn = await screen.findByTestId('admin-export-csv');
    expect(csvBtn).toBeInTheDocument();
    // ตรวจ PDF
    expect(await screen.findByTestId('admin-export-pdf')).toBeInTheDocument();
  });

  it('ไม่แสดงปุ่ม export เมื่อไม่มี reports', async () => {
    useSWRMock.mockImplementation((key: string) => {
      if (key === '/api/reports') return { data: undefined, error: undefined, isLoading: false };
      return { data: [], error: undefined, isLoading: false };
    });
    // render and wait for AuthProvider state
    await act(async () => {
      render(<AdminDashboardPage />, { role: 'ADMIN', route: '/dashboard/admin' });
    });
    // รอช่วงอัปเดตแล้วตรวจไม่พบ
    await waitFor(() => {
      expect(screen.queryByTestId('admin-export-csv')).to.be.null();
      expect(screen.queryByTestId('admin-export-pdf')).to.be.null();
    });
  });
});

