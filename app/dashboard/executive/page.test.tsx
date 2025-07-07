import '@testing-library/jest-dom/vitest';
/// <reference types="vitest" />
import React from 'react';
import { CacheStats, JobStats, DeploymentStats, SystemHealth, HealthPoint, Notification, Community, Patient } from '@/types/dashboard'
import { render, screen, fireEvent, waitFor, act, within, waitForElementToBeRemoved, cleanup, renderHook } from '@/app/dashboard/test-utils'
// Bypass RoleGuard in tests
vi.mock('@/components/RoleGuard', () => ({ __esModule: true, default: ({ children }: any) => children }));
import { vi, Mock } from 'vitest';
import * as swr from 'swr';

// Partial mock SWR preserving SWRConfig
vi.mock('swr', async () => {
  const actual = await vi.importActual<typeof import('swr')>('swr');
  return { __esModule: true, ...actual, default: vi.fn(), SWRConfig: actual.SWRConfig };
});
const useSWRMock = swr.default as unknown as Mock;

import ExecutiveDashboardPage from './page';
import * as exportLib from '@/lib/export';

// spy export functions
const mockExportCSV = vi.spyOn(exportLib, 'exportCSV');
const mockExportPDF = vi.spyOn(exportLib, 'exportPDF');

// NOTE: test-utils provides RoleGuard, localStorage, router mocks

// clear only
beforeEach(() => {
  vi.clearAllMocks();
});

// stub jsdom APIs
global.ResizeObserver = class { observe() {}; unobserve() {}; disconnect() {} };
Object.defineProperty(global.URL, 'createObjectURL', { configurable: true, writable: true, value: vi.fn() });

// no manual role/localStorage needed here

describe('ExecutiveDashboardPage Export', () => {
  afterEach(() => {
    cleanup();
    useSWRMock.mockReset();
    mockExportCSV.mockRestore();
    mockExportPDF.mockRestore();
  });

  it('แสดงปุ่ม export เมื่อมี summary', async () => {
    const summary = { totalDaily: 1, totalWeekly: 2, totalMonthly: 3, avgResponseTime: 4, satisfactionScore: 5, monthlyTrends: [], ratingTrends: [] };
    useSWRMock.mockImplementation((key: string) => {
      if (key === '/api/rides/summary') return { data: summary, error: undefined, isLoading: false };
      if (key === '/api/reports/leaderboard') return { data: [], error: undefined, isLoading: false };
      return { data: undefined, error: undefined, isLoading: false };
    });
    render(<ExecutiveDashboardPage />, { role: 'executive', route: '/dashboard/executive' });
    await waitFor(() => expect(screen.getByTestId('export-csv')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('export-csv'));
    expect(mockExportCSV).toHaveBeenCalledWith(summary);
    fireEvent.click(screen.getByTestId('export-pdf'));
    expect(mockExportPDF).toHaveBeenCalledWith(summary);
  });

  it('ไม่แสดงปุ่ม export เมื่อไม่มี summary', async () => {
    // mock based on URL
    useSWRMock.mockImplementation((key: string) => {
      if (key === '/api/rides/summary') return { data: null, error: undefined, isLoading: false };
      if (key === '/api/reports/leaderboard') return { data: [], error: undefined, isLoading: false };
      return { data: undefined, error: undefined, isLoading: false };
    });
    render(<ExecutiveDashboardPage />, { role: 'executive', route: '/dashboard/executive' });
    await waitFor(() => {
      expect(screen.queryByTestId('export-csv')).to.be.null();
      expect(screen.queryByTestId('export-pdf')).to.be.null();
    });
  });
});

