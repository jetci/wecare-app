import '@testing-library/jest-dom/vitest';
import React from 'react';
import { CacheStats, JobStats, DeploymentStats, SystemHealth, HealthPoint, Notification, Community, Patient } from '@/types/dashboard'
import { render, screen, fireEvent, waitFor, act, within, waitForElementToBeRemoved, cleanup, renderHook } from '@/app/dashboard/test-utils'
import { vi } from 'vitest';
import AdminDashboardContent from './page';

// Mock chart container dimensions to avoid zero width/height errors and fix read-only location.assign
beforeAll(() => {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { assign: vi.fn() }
  });
  // Ensure non-zero dimensions for chart rendering
  window.HTMLElement.prototype.getBoundingClientRect = (): DOMRect => ({
    width: 100,
    height: 100,
    top: 0,
    left: 0,
    bottom: 100,
    right: 100,
    x: 0,
    y: 0,
    toJSON: () => {},
  } as DOMRect);
});

// Stub ResizeObserver for jsdom
global.ResizeObserver = class { observe(){}; unobserve(){}; disconnect(){} };

describe('Logs Tab', () => {
  it('fetches logs with default date filter and displays rows', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue({ ok: true, json: async () => ({ logs: [{ id: '1', action: 'TestAction', timestamp: '2025-05-23T10:00:00Z', detail: 'Details' }], total: 1 }) } as unknown as Response);

    // render and wait for auth provider to initialize
    await act(async () => {
      render(<AdminDashboardContent />, { role: 'ADMIN', route: '/dashboard/admin' });
    });
    // click Logs tab
    const logsTab = await screen.findByRole('button', { name: /บันทึกกิจกรรม/ });
    await act(() => { fireEvent.click(logsTab); });

    // API call with headers
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      '/api/admin/logs?from=&to=&page=1&limit=10',
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: expect.any(String) }) })
    ));
    // table shows action
    const actionCell = await screen.findByText('TestAction');
    expect(actionCell).toBeInTheDocument();
  });

  it('shows error message on fetch failure', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({ ok: false } as unknown as Response);

    await act(async () => {
      render(<AdminDashboardContent />, { role: 'ADMIN', route: '/dashboard/admin' });
    });
    const errorTab = await screen.findByRole('button', { name: /บันทึกกิจกรรม/ });
    await act(() => { fireEvent.click(errorTab); });
    expect(await screen.findByText(/โหลดบันทึกกิจกรรมล้มเหลว/)).toBeInTheDocument();
  });
});

