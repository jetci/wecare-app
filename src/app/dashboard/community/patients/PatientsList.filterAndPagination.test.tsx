import React from 'react';
import { CacheStats, JobStats, DeploymentStats, SystemHealth, HealthPoint, Notification, Community, Patient } from '@/types/dashboard'
import { render, screen, fireEvent, waitFor, act, within, waitForElementToBeRemoved, cleanup, renderHook } from '@/app/dashboard/test-utils'
import PatientsList from './PatientsList';
import { vi } from 'vitest';

describe('PatientsList filter and pagination', () => {
  const generatePatients = (n: number) =>
    Array.from({ length: n }, (_, i) => ({ id: `${i}`, prefix: 'นาย', firstName: `Name${i}`, lastName: `Last${i}` }));

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const setupFetchMock = (patients: any[]) => {
    vi.spyOn(global, 'fetch').mockImplementation((input: any) => {
      const params = new URL(input.toString(), 'http://localhost').searchParams;
      const search = params.get('search') || '';
      const filtered = patients.filter((p) =>
        `${p.prefix} ${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase())
      );
      return Promise.resolve({ ok: true, json: async () => ({ patients: filtered, total: filtered.length }) } as any);
    });
  };

  it('filters list based on search term', async () => {
    const patients: Patient[] = generatePatients(5);
    patients.push({ id: 'unique', prefix: 'นาง', firstName: 'Unique', lastName: 'Tester' });
    setupFetchMock(patients);

    render(<PatientsList />);
    await waitFor(() => expect(screen.getByText(/นาย Name0 Last0/)).toBeInTheDocument());

    // Filter by unique name
    const searchInput = screen.getByPlaceholderText(/ค้นหาชื่อผู้ป่วย/);
    fireEvent.change(searchInput, { target: { value: 'Unique' } });
    await waitFor(() => {
      expect(screen.getByText(/นาง Unique Tester/)).toBeInTheDocument();
      expect(screen.queryByText(/นาย Name0 Last0/)).toBeNull();
    });
  });

  it('paginates list correctly', async () => {
    const total = 25;
    vi.spyOn(global, 'fetch').mockResolvedValue({ ok: true, json: async () => ({ patients: generatePatients(total), total }) } as any);

    render(<PatientsList />);
    // wait for first page
    await waitFor(() => expect(screen.getByText(/นาย Name0 Last0/)).toBeInTheDocument());
    // page info
    expect(screen.getByText(/1 \/ 3/)).toBeInTheDocument();
    // next page
    fireEvent.click(screen.getByRole('button', { name: /Next/ }));
    await waitFor(() => expect(screen.getByText(/นาย Name10 Last10/)).toBeInTheDocument());
    expect(screen.getByText(/2 \/ 3/)).toBeInTheDocument();
    // last page
    fireEvent.click(screen.getByRole('button', { name: /Next/ }));
    await waitFor(() => expect(screen.getByText(/นาย Name20 Last20/)).toBeInTheDocument());
    expect(screen.getByText(/3 \/ 3/)).toBeInTheDocument();
    // previous page
    fireEvent.click(screen.getByRole('button', { name: /Prev/ }));
    await waitFor(() => expect(screen.getByText(/นาย Name10 Last10/)).toBeInTheDocument());
    expect(screen.getByText(/2 \/ 3/)).toBeInTheDocument();
  });
});
