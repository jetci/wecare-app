import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditUserProfilePage from './page';
import useSWR from 'swr';

// Mock SWR and Next router
vi.mock('swr');
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mockPush }) }));

const mockUseSWR = useSWR as vi.Mock;
const mockPush = vi.fn();


describe('EditUserProfilePage Unit Tests', () => {
  beforeEach(() => {
    mockUseSWR.mockReturnValue({
      data: {
        user: {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          nationalId: '1234567890123',
          phone: '0812345678',
          birthDate: '2000-01-01',
          avatarUrl: '',
        },
      },
      error: undefined,
    });
    mockPush.mockClear();
    // default fetch mock
    global.fetch = vi.fn().mockResolvedValue({ ok: true });
  });

  it('shows validation error when fullName is empty', async () => {
    render(<EditUserProfilePage />);
    // wait for initial load
    const fullNameInput = await screen.findByLabelText(/ชื่อ-นามสกุล/);
    // clear fullName to trigger validation
    fireEvent.change(fullNameInput, { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /บันทึก/ }));
    expect(await screen.findByText(/กรุณากรอกชื่อ-นามสกุล/)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('disables submit button while submitting and navigates on success', async () => {
    let resolveFetch: (value?: any) => void;
    global.fetch = jest.fn().mockImplementation(
      () => new Promise(res => { resolveFetch = res; })
    );
    render(<EditUserProfilePage />);
    // wait for data population
    await screen.findByDisplayValue('John Doe');
    const submitBtn = screen.getByRole('button', { name: /บันทึก/ });
    fireEvent.click(submitBtn);
    expect(submitBtn).toBeDisabled();
    // resolve fetch
    resolveFetch({ ok: true });
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/dashboard/profile'));
  });
});
