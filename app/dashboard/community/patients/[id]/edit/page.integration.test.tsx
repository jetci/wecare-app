import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import EditPatientPage from './page';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams('?id=abc-123'),
}));

describe('EditPatientPage Integration Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockPush.mockClear();
  });

  it('loads data, edits fields, and submits PUT successfully', async () => {
    // Sequence: GET then PUT
    const getResponse = { patient: {
      fullName: 'John Doe',
      hospitalNumber: 'H001',
      nationalId: '1234567890123',
      birthDate: '1990-01-01',
      allergies: ['penicillin'],
      chronicDiseases: ['diabetes'],
      emergencyContact: { name: 'Jane', phone: '0987654321' },
    }};
    const fetchMock = vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce({ ok: true, json: async () => getResponse } as any)
      .mockResolvedValueOnce({ ok: true } as any);

    render(<EditPatientPage />);

    // wait for GET to resolve and form reset
    await waitFor(() => expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument());
    // change some fields
    fireEvent.change(screen.getByLabelText(/ชื่อ-นามสกุล/), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText(/แพ้ยา/), { target: { value: 'aspirin' } });
    // submit
    fireEvent.click(screen.getByRole('button', { name: /บันทึก/ }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    // validate PUT call
    const putCall = fetchMock.mock.calls[1];
    expect(putCall[0]).toBe('/api/patients/abc-123');
    const opts = putCall[1] as RequestInit;
    expect(opts.method).toBe('PUT');
    const body = JSON.parse(opts.body as string);
    expect(body.fullName).toBe('Jane Doe');
    expect(body.allergies).toEqual(['aspirin']);

    // ensure redirect
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/dashboard/community/patients'));
  });

  it('displays server error when PUT fails', async () => {
    // GET ok
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce({ ok: true, json: async () => ({ patient: {
        fullName: 'X', hospitalNumber: 'H', nationalId: '1234567890123', birthDate: '2000-01-01', allergies: [], chronicDiseases: [], emergencyContact: { name: '', phone: '' }
      }}) } as any)
      // PUT fails
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Server error' }) } as any);

    render(<EditPatientPage />);
    await waitFor(() => screen.getByDisplayValue('X'));

    fireEvent.click(screen.getByRole('button', { name: /บันทึก/ }));

    expect(await screen.findByText(/Server error/)).toBeInTheDocument();
  });
});
