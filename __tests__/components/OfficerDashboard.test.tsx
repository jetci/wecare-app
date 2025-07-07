import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, vi } from 'vitest';
import OfficerDashboard from '@/app/dashboard/officer/page';

// matchers for toHaveTextContent, toBeInTheDocument
import '@testing-library/jest-dom';

// Mock hooks
vi.mock('@/hooks/useOfficerPatients', () => ({
  useOfficerPatients: () => ({ data: [{ id: '1', area: 'A' }], isLoading: false, error: null }),
}));
vi.mock('@/hooks/useOfficerAppointments', () => ({
  useOfficerAppointments: () => ({ data: [{ id: '2', area: 'B', status: 'pending', date: new Date().toISOString() }], isLoading: false, error: null }),
}));

describe('OfficerDashboard Component', () => {
  it('renders stats and table', () => {
    render(<OfficerDashboard />);
    expect(screen.getByTestId('patients-count').textContent).contain('Patients: 1');
    expect(screen.getByTestId('appointments-count').textContent).contain('Appointments: 1');
    expect(screen.getByText('Approve')).toBeTruthy();
    expect(screen.getByText('Deny')).toBeTruthy();
  });

  it('shows loading state', () => {
    vi.mocked(require('@/hooks/useOfficerPatients').useOfficerPatients).mockReturnValue({ data: null, isLoading: true, error: null });
    vi.mocked(require('@/hooks/useOfficerAppointments').useOfficerAppointments).mockReturnValue({ data: null, isLoading: true, error: null });
    render(<OfficerDashboard />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('shows error state', () => {
    vi.mocked(require('@/hooks/useOfficerPatients').useOfficerPatients).mockReturnValue({ data: null, isLoading: false, error: new Error() });
    vi.mocked(require('@/hooks/useOfficerAppointments').useOfficerAppointments).mockReturnValue({ data: null, isLoading: false, error: new Error() });
    render(<OfficerDashboard />);
    expect(screen.getByTestId('error')).toBeInTheDocument();
  });
});
