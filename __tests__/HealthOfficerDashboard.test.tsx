import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, vi, beforeEach, afterEach, expect } from 'vitest';
import HealthOfficerDashboard from '@/components/dashboard/HealthOfficerDashboard';
import { RoleProvider } from '@/context/RoleContext';

vi.mock('@/services/api', () => ({
  fetchHealthOfficerData: vi.fn()
}));

const { fetchHealthOfficerData } = require('@/services/api');

function renderWithRole(ui: React.ReactNode, role: string) {
  return render(<RoleProvider value={role}>{ui}</RoleProvider>);
}

describe('HealthOfficerDashboard', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('แสดง loading ขณะโหลดข้อมูล', () => {
    fetchHealthOfficerData.mockReturnValue(new Promise(() => {})); // pending
    renderWithRole(<HealthOfficerDashboard />, 'HEALTH_OFFICER');
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('แสดงข้อมูลเมื่อโหลดสำเร็จ', async () => {
    const mockData = [{ id: 1, name: 'Test User' }];
    fetchHealthOfficerData.mockResolvedValue(mockData);
    renderWithRole(<HealthOfficerDashboard />, 'HEALTH_OFFICER');
    await waitFor(() => expect(screen.getByText('Test User')).toBeInTheDocument());
  });

  it('redirect ถ้าไม่ได้รับ role HEALTH_OFFICER', () => {
    renderWithRole(<HealthOfficerDashboard />, 'COMMUNITY');
    expect(screen.queryByTestId('healthofficer-dashboard')).not.toBeInTheDocument();
  });
});

