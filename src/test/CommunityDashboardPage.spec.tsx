import React from 'react';
import { describe, it, expect } from 'vitest';
import { rest } from 'msw';
import { server } from '@/test/mocks/server';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import CommunityDashboardPage from '@/app/dashboard/community/page';
import { AuthProvider } from '@/context/AuthContext';

// Mock data
const mockPatients = [
  { id: 1, firstName: 'Alice', lastName: 'Wonder', nationalId: '1101700203451', gender: 'หญิง' },
  { id: 2, firstName: 'Bob', lastName: 'Builder', nationalId: '1234567890128', gender: 'ชาย' },
];
const mockRequests = [
  { id: 10, nationalId: '1101700203451', requestType: 'Food', description: 'Need food supplies' },
  { id: 11, nationalId: '1234567890128', requestType: 'Shelter', description: 'Need blanket' },
];

describe('CommunityDashboardPage', () => {
  beforeAll(() => {
    // Override handlers for /api/patients and /api/community/requests
    server.use(
      rest.get('/api/patients', (req, res, ctx) => res(ctx.status(200), ctx.json(mockPatients))),
      rest.get('/api/community/requests', (req, res, ctx) => res(ctx.status(200), ctx.json(mockRequests)))
    );
  });

  it('renders patient requests table with name and gender', async () => {
    render(
      <AuthProvider>
        <CommunityDashboardPage />
      </AuthProvider>
    );

    // Wait for table rows to load
    await waitFor(() => {
      expect(screen.getByText('Alice Wonder')).toBeInTheDocument();
      expect(screen.getByText('หญิง')).toBeInTheDocument();
      expect(screen.getByText('Bob Builder')).toBeInTheDocument();
      expect(screen.getByText('ชาย')).toBeInTheDocument();
    });
  });

  it('filters requests by selected patient', async () => {
    render(
      <AuthProvider>
        <CommunityDashboardPage />
      </AuthProvider>
    );

    // Wait for dropdown
    const dropdown = await screen.findByRole('combobox');
    // Select Bob's nationalId
    fireEvent.change(dropdown, { target: { value: '1234567890128' } });

    // Only Bob's request should appear
    await waitFor(() => {
      expect(screen.getByText('Bob Builder')).toBeInTheDocument();
      expect(screen.queryByText('Alice Wonder')).toBeNull();
    });
  });
});
