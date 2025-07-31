// @ts-nocheck
import React from 'react';
import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
// @ts-ignore: default export
import EditPatientPage from './edit/page';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => ({ get: () => 'test-id' }),
}));

const server = setupServer(
  rest.get('/api/patients/test-id', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ patient: {
      fullName: 'Test User',
      hospitalNumber: 'HN001',
      nationalId: '1234567890123',
      birthDate: '29-07-2568',
      allergies: [],
      chronicDiseases: [],
      emergencyContact: { name: '', phone: '' },
    } }));
  }),
  rest.put('/api/patients/test-id', (req, res, ctx) => {
    const body = req.body as any;
    if (body.birthDate !== '29-07-2568') {
      return res(ctx.status(400), ctx.json({ error: 'Bad date' }));
    }
    return res(ctx.status(200));
  }),
);

describe('EditPatientPage Date Validation Tests', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('shows refine error for invalid Buddhist year', async () => {
    render(<EditPatientPage />);
    await waitFor(() => screen.getByDisplayValue('Test User'));
    const dateInput = screen.getByLabelText(/วันเกิด/);
    fireEvent.change(dateInput, { target: { value: '29-07-2023' } });
    fireEvent.click(screen.getByRole('button', { name: /บันทึก/ }));
    expect(await screen.findByText('ปีต้องไม่น้อยกว่า 2500 และรูปแบบต้องถูกต้อง')).toBeInTheDocument();
  });

  it('submits successfully with valid Buddhist date', async () => {
    render(<EditPatientPage />);
    await waitFor(() => screen.getByDisplayValue('Test User'));
    const dateInput = screen.getByLabelText(/วันเกิด/);
    fireEvent.change(dateInput, { target: { value: '29-07-2568' } });
    fireEvent.click(screen.getByRole('button', { name: /บันทึก/ }));
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/dashboard/community/patients');
    });
  });
});
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import EditPatientPage from './edit/page';
import { vi, expect } from 'vitest';
expect.extend(matchers);

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => ({ get: () => 'test-id' }),
}));

const server = setupServer(
  rest.get('/api/patients/test-id', (req: any, res: any, ctx: any) => {
    return res(ctx.status(200), ctx.json({ patient: {
      fullName: 'Test User',
      hospitalNumber: 'HN001',
      nationalId: '1234567890123',
      birthDate: '29-07-2568',
      allergies: [],
      chronicDiseases: [],
      emergencyContact: { name: '', phone: '' },
    } }));
  }),
  rest.put('/api/patients/test-id', (req: any, res: any, ctx: any) => {
    const body = req.body as any;
    // ensure valid date passed
    if (body.birthDate !== '29-07-2568') {
      return res(ctx.status(400), ctx.json({ error: 'Bad date' }));
    }
    return res(ctx.status(200));
  }),
);

describe('EditPatientPage Date Validation Tests', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('shows refine error for invalid Buddhist year', async () => {
    render(<EditPatientPage />);
    // wait for load
    await waitFor(() => screen.getByDisplayValue('Test User'));
    // change birthDate to invalid
    const dateInput = screen.getByLabelText(/วันเกิด/);
    fireEvent.change(dateInput, { target: { value: '29-07-2023' } });
    fireEvent.click(screen.getByRole('button', { name: /บันทึก/ }));
    expect(await screen.findByText('ปีต้องไม่น้อยกว่า 2500 และรูปแบบต้องถูกต้อง')).toBeInTheDocument();
  });

  it('submits successfully with valid Buddhist date', async () => {
    
    render(<EditPatientPage />);
    await waitFor(() => screen.getByDisplayValue('Test User'));
    const dateInput = screen.getByLabelText(/วันเกิด/);
    fireEvent.change(dateInput, { target: { value: '29-07-2568' } });
    fireEvent.click(screen.getByRole('button', { name: /บันทึก/ }));
    // wait for successful PUT and redirect
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/dashboard/community/patients');
    });
  });
});
