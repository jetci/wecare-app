import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, vi, beforeEach, afterEach, expect } from 'vitest';
import ExecutiveDashboard from '@/components/dashboard/ExecutiveDashboard';
import { RoleProvider } from '@/context/RoleContext';

vi.mock('@/services/api', () => ({
  fetchExecutiveData: vi.fn()
}));

const { fetchExecutiveData } = require('@/services/api');

function renderWithRole(ui: React.ReactNode, role: string) {
  return render(<RoleProvider value={role}>{ui}</RoleProvider>);
}

describe('ExecutiveDashboard', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('แสดง loading ขณะโหลดข้อมูล', () => {
    fetchExecutiveData.mockReturnValue(new Promise(() => {})); // pending
    renderWithRole(<ExecutiveDashboard />, 'EXECUTIVE');
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('แสดงข้อมูลเมื่อโหลดสำเร็จ', async () => {
    const mockData = [{ id: 1, name: 'Test User' }];
    fetchExecutiveData.mockResolvedValue(mockData);
    renderWithRole(<ExecutiveDashboard />, 'EXECUTIVE');
    await waitFor(() => expect(screen.getByText('Test User')).toBeInTheDocument());
  });

  it('redirect ถ้าไม่ได้รับ role EXECUTIVE', () => {
    renderWithRole(<ExecutiveDashboard />, 'COMMUNITY');
    expect(screen.queryByTestId('executive-dashboard')).not.toBeInTheDocument();
  });
});
