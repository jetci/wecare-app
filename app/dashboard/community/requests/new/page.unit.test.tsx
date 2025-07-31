import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NewRequestPage from './page';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

// MSW server to mock API
const server = setupServer(
  // patient search returns 404 when invalid nid
  rest.get('/api/patients', (req, res, ctx) => {
    const nid = req.url.searchParams.get('nationalId');
    if (nid === '1234567890123') {
      return res(ctx.json({
        patient: { prefix: 'นาย', firstName: 'ทดสอบ', lastName: 'หนึ่ง', currentAddress: 'ที่อยู่', currentAddress_phone: '0800000000', patientGroup: 'เยี่ยมบ้าน', pickupLocation_lat: 0, pickupLocation_lng: 0 }
      }));
    }
    return res(ctx.status(404), ctx.json({ error: 'ไม่พบผู้ป่วย' }));
  }),
  // catch-all for POST
  rest.post('/api/community/requests', (req, res, ctx) => res(ctx.status(200), ctx.json({ success: true })))
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('NewRequestPage Unit Tests', () => {
  test('shows validation errors and blocks submit on empty form', async () => {
    render(<NewRequestPage />);
    const submitBtn = screen.getByRole('button', { name: 'ส่งคำขอ' });
    expect(submitBtn).toBeDisabled();

    // attempt search with empty nid
    fireEvent.click(screen.getByRole('button', { name: 'ค้นหา' }));
    expect(await screen.findByText(/เลขบัตรประชาชนต้องมี 13 หลัก/)).toBeInTheDocument();
  });

  test('shows error for invalid serviceDate', async () => {
    render(<NewRequestPage />);
    // valid nid to get patient
    fireEvent.change(screen.getByRole('textbox', { name: 'เลขบัตรประชาชน' }), { target: { value: '1234567890123' } });
    fireEvent.click(screen.getByRole('button', { name: 'ค้นหา' }));
    await waitFor(() => expect(screen.getByDisplayValue('นาย ทดสอบ หนึ่ง')).toBeInTheDocument());
    // fill invalid date
    fireEvent.change(screen.getByRole('textbox', { name: 'วันที่ต้องการใช้บริการ' }), { target: { value: '01-01-2020' } });
    // request type
    fireEvent.change(screen.getByRole('combobox', { name: 'ประเภทคำขอ' }), { target: { value: 'เยี่ยมบ้าน' } });
    // btn should be enabled now
    const submit = screen.getByRole('button', { name: 'ส่งคำขอ' });
    expect(submit).toBeEnabled();
    fireEvent.click(submit);
    expect(await screen.findByText(/ปีต้องไม่น้อยกว่า 2500/)).toBeInTheDocument();
  });
});
