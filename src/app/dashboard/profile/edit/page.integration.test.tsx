import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import EditUserProfilePage from './page';
import useSWR from 'swr';

// Mock Next.js useRouter
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: mockPush }) }));

// SWR fallback to real fetch; we'll override via MSW
jest.mock('swr');
const realFetch = window.fetch;
const mockUseSWR = useSWR as jest.Mock;

// Mock user data
const userData = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  nationalId: '1234567890123',
  phone: '0812345678',
  birthDate: '2000-01-01',
  avatarUrl: '',
};

const server = setupServer(
  // GET /api/auth/profile
  rest.get('/api/auth/profile', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ user: userData }));
  }),
  // PUT /api/auth/profile: default success
  rest.put('/api/auth/profile', (req, res, ctx) => {
    return res(ctx.status(200));
  })
);

describe('EditUserProfilePage Integration', () => {
  beforeAll(() => {
    server.listen();
    // SWR returns { data, error }
    mockUseSWR.mockReturnValue({ data: { user: userData }, error: undefined });
  });
  afterEach(() => {
    server.resetHandlers();
    mockPush.mockClear();
  });
  afterAll(() => {
    server.close();
    window.fetch = realFetch;
  });

  it('loads form, updates values, and submits successfully', async () => {
    render(<EditUserProfilePage />);
    // Wait for form to populate
    const fullNameInput = await screen.findByDisplayValue('John Doe');
    // Change fullName
    fireEvent.change(fullNameInput, { target: { value: 'Jane Smith' } });
    // Submit
    fireEvent.click(screen.getByRole('button', { name: /บันทึก/ }));
    // Expect push on success
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/dashboard/profile'));
  });

  it('shows submitError on PUT failure', async () => {
    // Override PUT handler to return 500
    server.use(
      rest.put('/api/auth/profile', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server error' }));
      })
    );
    render(<EditUserProfilePage />);
    const fullNameInput = await screen.findByDisplayValue('John Doe');
    fireEvent.change(fullNameInput, { target: { value: 'Error Case' } });
    fireEvent.click(screen.getByRole('button', { name: /บันทึก/ }));
    // Expect error message
    expect(await screen.findByText(/Update failed/)).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
