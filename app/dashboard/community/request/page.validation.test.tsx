import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/app/dashboard/test-utils';
import CommunityRequestPage from './page';
import { vi } from 'vitest';

// Mock useCreateRide hook
const createRideMock = vi.fn().mockResolvedValue(undefined);
vi.mock('@/hooks/useCreateRide', () => ({
  useCreateRide: () => ({ createRide: createRideMock }),
}));

describe('CommunityRequestPage Validation', () => {
  beforeEach(() => {
    createRideMock.mockClear();
  });

  it('shows validation errors when submitting empty form', async () => {
    render(<CommunityRequestPage />, { role: 'COMMUNITY', route: '/dashboard/community/request' });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    expect(await screen.findByText(/Origin is required/)).toBeInTheDocument();
    expect(screen.getByText(/Description is required/)).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    render(<CommunityRequestPage />, { role: 'COMMUNITY', route: '/dashboard/community/request' });
    fireEvent.input(screen.getByLabelText(/Origin/i), { target: { value: 'Home' } });
    fireEvent.input(screen.getByLabelText(/รายละเอียด/i), { target: { value: 'Need help' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    await waitFor(() => expect(createRideMock).toHaveBeenCalledWith({ origin: 'Home', description: 'Need help' }));
  });

  it('matches snapshot', () => {
    const { asFragment } = render(<CommunityRequestPage />, { role: 'COMMUNITY', route: '/dashboard/community/request' });
    expect(asFragment()).toMatchSnapshot();
  });
});

