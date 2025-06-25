import React from 'react';
import { render, screen } from '@testing-library/react';
import useSWR from 'swr';
import DashboardLayout from '../src/app/dashboard/layout';
import { vi, type Mock } from 'vitest';

// Mock useSWR hook for profile data
vi.mock('swr');
const mockUseSWR = useSWR as unknown as Mock;

describe('DashboardLayout sidebar access', () => {
  beforeEach(() => {
    mockUseSWR.mockReset();
  });

  it('shows Developer Dashboard link when nationalId matches', () => {
    mockUseSWR.mockReturnValue({ data: { user: { nationalId: '3500200461028' } }, isLoading: false });
    render(<DashboardLayout><div>Content</div></DashboardLayout>);
    expect(screen.getByText('ผู้พัฒนาระบบ')).toBeInTheDocument();
  });

  it('hides Developer Dashboard link when nationalId does not match', () => {
    mockUseSWR.mockReturnValue({ data: { user: { nationalId: 'WRONG_ID' } }, isLoading: false });
    render(<DashboardLayout><div>Content</div></DashboardLayout>);
    expect(screen.queryByText('ผู้พัฒนาระบบ')).toBeNull();
  });
});
