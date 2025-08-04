import '@testing-library/jest-dom/vitest';
import React from 'react';
import { CacheStats, JobStats, DeploymentStats, SystemHealth, HealthPoint, Notification, Community, Patient } from '@/types/dashboard'
import { render, screen, fireEvent, waitFor, act, within, waitForElementToBeRemoved } from '@/app/dashboard/test-utils'
import { vi } from 'vitest';

// Mock next/navigation before importing component
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams('?id=123'),
}));

import EditPatientPage from './page';

describe('EditPatientPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockPush.mockClear();
  });

  it('renders fetched patient data in form', async () => {
    // mock GET
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce({ ok: true, json: async () => ({ patient: { prefix: 'นาย', firstName: 'A', lastName: 'B', phone: '012345' } }) } as any);

    render(<EditPatientPage />)
    // wait for form values
    await waitFor(() => expect(screen.getByDisplayValue('A')).toBeInTheDocument());
    expect(screen.getByDisplayValue('นาย')).toBeInTheDocument();
    expect(screen.getByDisplayValue('B')).toBeInTheDocument();
    expect(screen.getByDisplayValue('012345')).toBeInTheDocument();
  })

  it('shows error message if fetch fails', async () => {
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce({ ok: false, statusText: 'Not Found' } as any);

    render(<EditPatientPage />)
    await waitFor(() => expect(screen.getByText(/Error:/i)).toBeInTheDocument());
  })

  it('submits updated data and redirects on success', async () => {
    // GET
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce({ ok: true, json: async () => ({ patient: { prefix: '', firstName: '', lastName: '', phone: '' } }) } as any)
      // PATCH
      .mockResolvedValueOnce({ ok: true } as any);

    render(<EditPatientPage />)
    await waitFor(() => expect(screen.getByRole('button', { name: /บันทึก/i })).toBeInTheDocument());
    // fill required fields
    fireEvent.change(screen.getByLabelText(/คำนำหน้า/), { target: { value: 'นาย' } });
    fireEvent.change(screen.getByLabelText(/ชื่อ/), { target: { value: 'C' } });
    fireEvent.change(screen.getByLabelText(/นามสกุล/), { target: { value: 'D' } });
    fireEvent.change(screen.getByLabelText(/เบอร์โทรศัพท์/), { target: { value: '0123456789' } });
    fireEvent.click(screen.getByRole('button', { name: /บันทึก/i }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/dashboard/community/patients'));
  })

  it('shows error on submit failure', async () => {
    // GET
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce({ ok: true, json: async () => ({ patient: { prefix: '', firstName: '', lastName: '', phone: '' } }) } as any)
      // PATCH fail
      .mockResolvedValueOnce({ ok: false } as any);

    render(<EditPatientPage />)
    await waitFor(() => expect(screen.getByRole('button', { name: /บันทึก/i })).toBeInTheDocument());
    // fill with valid inputs to pass validation
    fireEvent.change(screen.getByLabelText(/คำนำหน้า/), { target: { value: 'นาย' } });
    fireEvent.change(screen.getByLabelText(/ชื่อ/), { target: { value: 'C' } });
    fireEvent.change(screen.getByLabelText(/นามสกุล/), { target: { value: 'D' } });
    fireEvent.change(screen.getByLabelText(/เบอร์โทรศัพท์/), { target: { value: '0123456789' } });
    fireEvent.click(screen.getByRole('button', { name: /บันทึก/i }));
    expect(await screen.findByText((c) => c.includes('Update failed'))).toBeInTheDocument();
  })

  it('shows validation errors when submitting empty or invalid inputs', async () => {
    // mock GET returns valid patient
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce({ ok: true, json: async () => ({ patient: { prefix: 'นาย', firstName: 'A', lastName: 'B', phone: '0123456789' } }) } as any);
    render(<EditPatientPage />)
    await waitFor(() => expect(screen.getByRole('button', { name: /บันทึก/i })).toBeInTheDocument());
    // clear fields and set invalid phone
    fireEvent.change(screen.getByLabelText(/คำนำหน้า/), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/ชื่อ/), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/นามสกุล/), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/เบอร์โทรศัพท์/), { target: { value: 'abc' } });
    fireEvent.click(screen.getByRole('button', { name: /บันทึก/i }));
    expect(await screen.findByText((c) => c.includes('กรุณากรอกคำนำหน้า'))).toBeInTheDocument();
    expect(screen.getByText((c) => c.includes('กรุณากรอกชื่อ'))).toBeInTheDocument();
    expect(screen.getByText((c) => c.includes('กรุณากรอกนามสกุล'))).toBeInTheDocument();
    // phone regex error
    expect(await screen.findByText((c) => c.includes('เบอร์โทรศัพท์ไม่ถูกต้อง'))).toBeInTheDocument();
  })
})
