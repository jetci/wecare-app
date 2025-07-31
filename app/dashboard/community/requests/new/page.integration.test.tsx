import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { vi } from 'vitest';
import NewRequestPage from './page';

// 固定วันที่
const FIXED_DATE = new Date('2025-07-30T00:00:00Z');

// Mock server
const server = setupServer(
  rest.get('/api/patients', (req, res, ctx) => {
    return res(ctx.json({
      patient: {
        prefix: 'นางสาว', firstName: 'ดอกไม้', lastName: 'ทอง',
        currentAddress: 'บางรัก', currentAddress_phone: '0801112222', patientGroup: 'รับส่งผู้ป่วย', pickupLocation_lat: 0, pickupLocation_lng: 0
      }
    }));
  }),
  rest.post('/api/community/requests', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ success: true }));
  })
);

beforeAll(() => {
  server.listen();
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_DATE);
});
afterEach(() => server.resetHandlers());
afterAll(() => {
  server.close();
  vi.useRealTimers();
});

describe('NewRequestPage Integration Tests', () => {
  test('full valid flow shows preview, submits, and alerts success', async () => {
    // spy on alert
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<NewRequestPage />);

    // fill nationalId and search
    fireEvent.change(screen.getByLabelText('เลขบัตรประชาชน'), { target: { value: '1234567890123' } });
    fireEvent.click(screen.getByText('ค้นหา'));
    // wait for readonly fields
    await waitFor(() => expect(screen.getByDisplayValue('นางสาว ดอกไม้ ทอง')).toBeInTheDocument());

    // fill serviceDate: tomorrow (2025-07-31 => พ.ศ. 2568)
    const dt = new Date(FIXED_DATE);
    dt.setDate(dt.getDate() + 1);
    const dd = String(dt.getDate()).padStart(2, '0');
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const by = dt.getFullYear() + 543;
    const dateStr = `${dd}-${mm}-${by}`;
    const dateInput = screen.getByLabelText('วันที่ต้องการใช้บริการ');
    fireEvent.change(dateInput, { target: { value: dateStr } });
    // preview shows dd MMMM yyyy พ.ศ.
    await waitFor(() => expect(screen.getByText(/2568/)).toBeInTheDocument());

    // select request type
    fireEvent.change(screen.getByLabelText('ประเภทคำขอ'), { target: { value: 'รับส่งผู้ป่วย' } });
    // fill details
    fireEvent.change(screen.getByLabelText('รายละเอียดเพิ่มเติม'), { target: { value: 'รายละเอียดทดสอบ' } });

    const submit = screen.getByRole('button', { name: 'ส่งคำขอ' });
    expect(submit).toBeEnabled();
    fireEvent.click(submit);

    // button disabled when submitting
    expect(submit).toBeDisabled();

    await waitFor(() => expect(alertMock).toHaveBeenCalledWith('สร้างคำขอสำเร็จ'));
    alertMock.mockRestore();
  });

  test('shows server error alert on failure', async () => {
    // mock failure
    server.use(
      rest.post('/api/community/requests', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Internal error' }));
      })
    );
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<NewRequestPage />);
    // bypass search by setting patient state directly? Simulate valid search
    fireEvent.change(screen.getByLabelText('เลขบัตรประชาชน'), { target: { value: '1234567890123' } });
    fireEvent.click(screen.getByText('ค้นหา'));
    await waitFor(() => expect(screen.getByDisplayValue('นางสาว ดอกไม้ ทอง')).toBeInTheDocument());

    // fill valid date
    fireEvent.change(screen.getByLabelText('วันที่ต้องการใช้บริการ'), { target: { value: '31-07-2568' } });
    fireEvent.change(screen.getByLabelText('ประเภทคำขอ'), { target: { value: 'เยี่ยมบ้าน' } });

    const submit = screen.getByRole('button', { name: 'ส่งคำขอ' });
    fireEvent.click(submit);
    await waitFor(() => expect(alertMock).toHaveBeenCalledWith('Internal error'));
    alertMock.mockRestore();
  });
});
