import React from 'react';
import { CacheStats, JobStats, DeploymentStats, SystemHealth, HealthPoint, Notification, Community, Patient } from '@/types/dashboard'
import { render, screen, fireEvent, waitFor, act, within, waitForElementToBeRemoved, cleanup, renderHook } from '@/app/dashboard/test-utils'
import { vi } from 'vitest';
import PatientsList from './PatientsList';

describe('PatientsList', () => {
  // Authenticated as community by wrapper

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows empty state', async () => {
    // stub fetch for auth and empty patients
    vi.stubGlobal('fetch', (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();
      if (url.includes('/api/auth/profile')) {
        return Promise.resolve({ ok: true, json: async () => ({ id: '1', name: 'Test', role: 'COMMUNITY' }) });
      }
      return Promise.resolve({ ok: true, json: async () => ({ patients: [], total: 0 }) } as any);
    });
    const { findByRole } = render(<PatientsList />, { role: 'COMMUNITY' });
    // assert empty state
    expect(await findByRole('alert', { name: /ไม่มีข้อมูลผู้ป่วย/ })).toBeInTheDocument();
  });

  it('renders list of patients when data is returned', async () => {
    const fakePatients = [
      { id: '1', prefix: 'นาย', firstName: 'John', lastName: 'Doe' },
      { id: '2', prefix: 'นางสาว', firstName: 'Jane', lastName: 'Smith' },
    ];
    vi.stubGlobal('fetch', (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();
      if (url.includes('/api/auth/profile')) {
        return Promise.resolve({ ok: true, json: async () => ({ id: '1', name: 'Test', role: 'COMMUNITY' }) });
      }
      return Promise.resolve({ ok: true, json: async () => ({ patients: fakePatients, total: fakePatients.length }) } as any);
    });
    const { findAllByRole } = render(<PatientsList />, { role: 'COMMUNITY' });
    // list items
    const items = await findAllByRole('listitem');
    expect(items).toHaveLength(fakePatients.length);
    expect(items[0]).toHaveTextContent('นาย John Doe');
    expect(items[1]).toHaveTextContent('นางสาว Jane Smith');
  });

  it('shows error message on fetch failure', async () => {
    // stub fetch for auth and error
    vi.stubGlobal('fetch', (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();
      if (url.includes('/api/auth/profile')) {
        return Promise.resolve({ ok: true, json: async () => ({ id: '1', name: 'Test', role: 'COMMUNITY' }) });
      }
      return Promise.resolve({ ok: false, statusText: 'Server Error' } as any);
    });
    const { findByRole } = render(<PatientsList />, { role: 'COMMUNITY' });
    expect(await findByRole('alert', { name: /Error:/i })).toBeInTheDocument();
  });
});
