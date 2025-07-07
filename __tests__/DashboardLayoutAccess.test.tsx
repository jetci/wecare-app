import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import useSWR from 'swr';
import { vi } from 'vitest';
import DashboardLayout from '../src/app/dashboard/layout';

// Mock useSWR hook
vi.mock('swr');
const mockUseSWR = useSWR as unknown as any;

describe('DashboardLayout developer links access', () => {
  afterEach(() => {
    mockUseSWR.mockReset();
  });

  it('shows all dashboard links when user is the allowed developer', () => {
    mockUseSWR.mockReturnValue({ data: { user: { nationalId: '3500200461028' } }, isLoading: false });
    render(<DashboardLayout><div>Child</div></DashboardLayout>);
    const labels = [
      'ประชาชน',
      'คนขับ',
      'เจ้าหน้าที่สาธารณสุข',
      'ผู้บริหาร',
      'ผู้ดูแลระบบ',
      'ผู้พัฒนาระบบ',
    ];
    labels.forEach(label => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('hides developer link for non-developer users', () => {
    mockUseSWR.mockReturnValue({ data: { user: { nationalId: 'WRONG_ID' } }, isLoading: false });
    render(<DashboardLayout><div>Child</div></DashboardLayout>);
    expect(screen.queryByText('ผู้พัฒนาระบบ')).to.be.null();
  });
});

