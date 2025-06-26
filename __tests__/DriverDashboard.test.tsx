import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, vi, beforeEach, afterEach, expect } from 'vitest';
import DriverDashboard from '@/components/dashboard/DriverDashboard';
import { RoleProvider } from '@/context/RoleContext';

vi.mock('@/services/api', () => ({
  fetchDriverData: vi.fn()
}));

const { fetchDriverData } = require('@/services/api');

function renderWithRole(ui: React.ReactNode, role: string) {
  return render(<RoleProvider value={role}>{ui}</RoleProvider>);
}

describe('DriverDashboard', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('แสดง loading ขณะโหลดข้อมูล', () => {
    fetchDriverData.mockReturnValue(new Promise(() => {})); // pending
    renderWithRole(<DriverDashboard />, 'DRIVER');
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('แสดงข้อมูลเมื่อโหลดสำเร็จ', async () => {
    const mockData = [{ id: 1, name: 'Test User' }];
    fetchDriverData.mockResolvedValue(mockData);
    renderWithRole(<DriverDashboard />, 'DRIVER');
    await waitFor(() => expect(screen.getByText('Test User')).toBeInTheDocument());
  });

  it('redirect ถ้าไม่ได้รับ role DRIVER', () => {
    renderWithRole(<DriverDashboard />, 'COMMUNITY');
    expect(screen.queryByTestId('driver-dashboard')).not.toBeInTheDocument();
  });
});
