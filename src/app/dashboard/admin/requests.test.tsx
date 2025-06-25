/// <reference types="vitest" />
import { vi, Mock } from 'vitest';
// Mock recharts to avoid width/height errors
vi.mock('recharts', () => {
  const React = require('react');
  return {
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
    LineChart: ({ children }: any) => <div>{children}</div>,
    CartesianGrid: () => <div />, XAxis: () => <div />, YAxis: () => <div />, Tooltip: () => <div />, Line: () => <div />
  };
});

import { SWRConfig } from 'swr';
import React from 'react';
import { CacheStats, JobStats, DeploymentStats, SystemHealth, HealthPoint, Notification, Community, Patient } from '@/types/dashboard'
import { render, screen, fireEvent, waitFor, act, within, waitForElementToBeRemoved, cleanup, renderHook } from '@/app/dashboard/test-utils'
import AdminDashboardPage from './page';
import toast from 'react-hot-toast';

// make window.location.assign writable
Object.defineProperty(window, 'location', {
  writable: true,
  value: { assign: vi.fn() },
});

// Stub ResizeObserver for jsdom
global.ResizeObserver = class { observe(){}; unobserve(){}; disconnect(){} };

// test-utils sets userRole, router, SWRConfig

// Mock toast default export
vi.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

beforeEach(() => {
  vi.clearAllMocks();
  // Mock auth token for Authorization header
  localStorage.setItem('token', 'mocked-token');
});

afterEach(() => {
  vi.restoreAllMocks();
});

// Mock fetch and type as Mock for chaining
global.fetch = vi.fn();
const fetchMock = global.fetch as Mock;

// Helper to find action buttons by exact text
async function getActionButton(label: string) {
  // Find button by accessible name (aria-label or text)
  return await screen.findByRole('button', { name: label });
}

describe('AdminDashboard - Requests Tab', () => {
  beforeEach(() => {
    // navigation stub already defined via defineProperty
    vi.clearAllMocks();
  });

  it('approves a user request and shows success toast', async () => {
    // Stub fetch: summary, pending requests, approve PUT, revalidation
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => ({ usersByGroup: [], weeklyTrends: [], pendingRequests: 0, totalRides: 0 }) }) // summary
      .mockResolvedValueOnce({ ok: true, json: async () => ({ users: [{ id: '1', prefix: 'นาย', firstName: 'A', lastName: 'B', role: 'DRIVER' }], total: 1 }) }) // initial pending
      .mockResolvedValueOnce({ ok: true }) // approve PUT
      .mockResolvedValueOnce({ ok: true, json: async () => ({ users: [], total: 0 }) }); // revalidation
    render(<SWRConfig value={{ dedupingInterval: 0, provider: () => new Map(), errorRetryCount: 0 }}><AdminDashboardPage /></SWRConfig>, { role: 'ADMIN', route: '/dashboard/admin' });
    // Switch to Requests tab
    const reqTab = await screen.findByRole('button', { name: /คำขอใช้งาน/i });
    fireEvent.click(reqTab);

    const row1 = await screen.findByTestId('request-row-1');
    const approveBtn = within(row1).getByTestId('approve-button');
    fireEvent.click(approveBtn);

    // รอให้ toast.success ถูกเรียกด้วยข้อความ 'อนุมัติแล้ว'
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('อนุมัติแล้ว')));
    // Verify PUT approval options
    const putCall = fetchMock.mock.calls.find(call => call[0] === '/api/admin/users/1');
    expect(putCall).toBeDefined();
    const [, putOpts] = putCall!;
    expect(putOpts.method).toBe('PUT');
    expect(putOpts.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(putOpts.body).toBe(JSON.stringify({ approved: true }));
  });

  it('handles reject failure with error toast', async () => {
    // Stub fetch: summary, pending requests, reject PUT failure
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => ({ usersByGroup: [], weeklyTrends: [], pendingRequests: 0, totalRides: 0 }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ users: [{ id: '1', prefix: 'นาย', firstName: 'A', lastName: 'B', role: 'DRIVER' }], total: 1 }) })
      .mockResolvedValueOnce({ ok: false });
    window.confirm = vi.fn().mockReturnValue(true);
    render(<SWRConfig value={{ dedupingInterval: 0, provider: () => new Map(), errorRetryCount: 0 }}><AdminDashboardPage /></SWRConfig>, { role: 'ADMIN', route: '/dashboard/admin' });
    const reqTab2 = await screen.findByRole('button', { name: /คำขอใช้งาน/i });
    fireEvent.click(reqTab2);
    const row2 = await screen.findByTestId('request-row-1');
    const rejectBtn = within(row2).getByTestId('reject-button');
    fireEvent.click(rejectBtn);
    fireEvent.click(await screen.findByRole('button', { name: /ยืนยันไม่อนุมัติ/ }));
    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    // Verify PUT reject options
    const rejectCall = fetchMock.mock.calls.find(call => call[0] === '/api/admin/users/1');
    expect(rejectCall).toBeDefined();
    const [, rejectOpts] = rejectCall!;
    expect(rejectOpts.method).toBe('PUT');
    expect(rejectOpts.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(rejectOpts.body).toBe(JSON.stringify({ approved: false }));
  });

  it('opens and closes reject confirmation modal', async () => {
    // Stub fetch: summary, pending requests
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => ({ usersByGroup: [], weeklyTrends: [], pendingRequests: 0, totalRides: 0 }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ users: [{ id: '1', prefix: 'นาย', firstName: 'A', lastName: 'B', role: 'DRIVER' }], total: 1 }) });
    render(<SWRConfig value={{ dedupingInterval: 0, provider: () => new Map(), errorRetryCount: 0 }}><AdminDashboardPage /></SWRConfig>, { role: 'ADMIN', route: '/dashboard/admin' });
    const reqTab3 = await screen.findByRole('button', { name: /คำขอใช้งาน/i });
    fireEvent.click(reqTab3);
    const row3 = await screen.findByTestId('request-row-1');
    const rejectBtn = within(row3).getByTestId('reject-button');
    fireEvent.click(rejectBtn);
    // modal should open
    const modal = await screen.findByTestId('reject-modal');
    expect(modal).toBeInTheDocument();
    // close modal
    fireEvent.click(screen.getByLabelText('ยกเลิก'));
    await waitFor(() => expect(screen.queryByTestId('reject-modal')).toBeNull());
  });

  it('refetches data after approve and updates table', async () => {
    // Stub fetch: summary, pending, PUT, revalidation
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => ({ usersByGroup: [], weeklyTrends: [], pendingRequests: 0, totalRides: 0 }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ users: [{ id: '1', prefix: 'นาย', firstName: 'A', lastName: 'B', role: 'DRIVER' }], total: 1 }) })
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ users: [], total: 0 }) });
    render(<SWRConfig value={{ dedupingInterval: 0, provider: () => new Map(), errorRetryCount: 0 }}><AdminDashboardPage /></SWRConfig>, { role: 'ADMIN', route: '/dashboard/admin' });
    const reqTab4 = await screen.findByRole('button', { name: /คำขอใช้งาน/i });
    fireEvent.click(reqTab4);
    // initial row exists with A B
    expect(await screen.findByTestId('request-row-1')).toBeInTheDocument();
    // approve
    const row4 = await screen.findByTestId('request-row-1');
    const approveBtn = within(row4).getByTestId('approve-button');
    fireEvent.click(approveBtn);
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('อนุมัติแล้ว'));
    // table should display no data message after approve
    await waitFor(() => expect(screen.getByText('ไม่พบข้อมูล')).toBeInTheDocument());
  });

  it('refetches requests after approve', async () => {
    // Stub fetch: summary, pending, then approve PUT
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => ({ usersByGroup: [], weeklyTrends: [], pendingRequests: 0, totalRides: 0 }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ users: [{ id: '1', prefix: 'นาย', firstName: 'A', lastName: 'B', role: 'DRIVER' }], total: 1 }) })
      .mockResolvedValueOnce({ ok: true });
    render(<SWRConfig value={{ dedupingInterval: 0, provider: () => new Map(), errorRetryCount: 0 }}><AdminDashboardPage /></SWRConfig>, { role: 'ADMIN', route: '/dashboard/admin' });
    const reqTab5 = await screen.findByRole('button', { name: /คำขอใช้งาน/i });
    fireEvent.click(reqTab5);
    const row5 = await screen.findByTestId('request-row-1');
    const approveBtn = within(row5).getByTestId('approve-button');
    fireEvent.click(approveBtn);
    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    // Verify PUT approval options
    const refetchCall = fetchMock.mock.calls.find(call => call[0] === '/api/admin/users/1');
    expect(refetchCall).toBeDefined();
    const [, refetchOpts] = refetchCall!;
    expect(refetchOpts.method).toBe('PUT');
    expect(refetchOpts.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(refetchOpts.body).toBe(JSON.stringify({ approved: true }));
  });
});
