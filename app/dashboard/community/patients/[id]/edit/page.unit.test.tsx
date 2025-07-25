import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import EditPatientPage from './page';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams('?id=123'),
}));

describe('EditPatientPage Unit Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('shows validation errors when submitting empty form', async () => {
    // Mock GET
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          patient: {
            fullName: '',
            hospitalNumber: '',
            nationalId: '',
            birthDate: '',
            allergies: [],
            chronicDiseases: [],
            emergencyContact: { name: '', phone: '' },
          },
        }),
      } as any);

    render(<EditPatientPage />);

    await waitFor(() => screen.getByRole('button', { name: /บันทึก/ }));
    fireEvent.click(screen.getByRole('button', { name: /บันทึก/ }));

    expect(await screen.findByText('กรุณากรอกชื่อ-นามสกุลผู้ป่วย')).toBeInTheDocument();
    expect(screen.getByText('กรุณากรอกหมายเลขโรงพยาบาล')).toBeInTheDocument();
    expect(screen.getByText('เลขบัตรประชาชนต้องมี 13 หลัก')).toBeInTheDocument();
    expect(screen.getByText('รูปแบบวันที่ต้องเป็น dd-MM-yyyy')).toBeInTheDocument();
  });

  it('does not submit when form is invalid', async () => {
    const mockFetch = vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          patient: {
            fullName: 'John Doe',
            hospitalNumber: 'H123',
            nationalId: '1234567890123',
            birthDate: '2000-01-01',
            allergies: [],
            chronicDiseases: [],
            emergencyContact: { name: '', phone: '' },
          },
        }),
      } as any)
      .mockResolvedValueOnce({ ok: true } as any);

    render(<EditPatientPage />);
    await waitFor(() => screen.getByDisplayValue('John Doe'));

    // Intentionally make phone invalid by changing a field under schema
    fireEvent.change(screen.getByLabelText(/เลขบัตรประชาชน/), { target: { value: 'invalid' } });
    fireEvent.click(screen.getByRole('button', { name: /บันทึก/ }));

    // Only GET should be called; no PUT
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });
});
