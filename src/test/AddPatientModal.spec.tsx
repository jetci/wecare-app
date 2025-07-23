import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { rest } from 'msw';
import { server } from '@/test/mocks/server';
import { renderForm } from '@/test/utils/formTestUtils';
import AddPatientModal from '@/components/community/AddPatientModal';

// Helpers to fill basic fields
const fillBasicFields = async ({ getByLabelText, getByText }) => {
  fireEvent.change(getByLabelText('คำนำหน้า'), { target: { value: 'นาย' } });
  fireEvent.change(getByLabelText('ชื่อจริง'), { target: { value: 'John' } });
  fireEvent.change(getByLabelText('นามสกุล'), { target: { value: 'Doe' } });
  fireEvent.change(getByLabelText('เลขบัตรประชาชน'), { target: { value: '1101700203451' } });
  // set birthDate via blur for simplicity
  fireEvent.change(getByLabelText('วัน/เดือน/ปีเกิด'), { target: { value: '01/01/2020' } });
};

describe('AddPatientModal.spec.tsx', () => {
  const onClose = vi.fn();
  const onSuccess = vi.fn();

  beforeEach(() => {
    onClose.mockClear();
    onSuccess.mockClear();
  });

  it('should show error when nationalId invalid', async () => {
    const { getByLabelText, getByText } = renderForm(
      <AddPatientModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />
    );
    fireEvent.change(getByLabelText('เลขบัตรประชาชน'), { target: { value: '1234' } });
    fireEvent.blur(getByLabelText('เลขบัตรประชาชน'));
    expect(await getByText('เลขบัตรประชาชนไม่ถูกต้อง')).toBeInTheDocument();
  });

  it('submits and calls API on valid data', async () => {
    // mock success
    server.use(
      rest.post('/api/patients', (req, res, ctx) => res(ctx.status(201), ctx.json({ id: 99 })))
    );
    const { getByText, getByLabelText, findByText } = renderForm(
      <AddPatientModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />
    );
    await fillBasicFields({ getByLabelText, getByText });
    fireEvent.click(getByText('เพิ่มผู้ป่วย'));
    expect(await findByText('เพิ่มข้อมูลผู้ป่วยสำเร็จ!')).toBeInTheDocument();
    expect(onSuccess).toHaveBeenCalled();
  });

  it('displays API error feedback on server failure', async () => {
    server.use(
      rest.post('/api/patients', (req, res, ctx) => res(ctx.status(500), ctx.json({ message: 'Server error' })))
    );
    const { getByText, getByLabelText, findByText } = renderForm(
      <AddPatientModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />
    );
    await fillBasicFields({ getByLabelText, getByText });
    fireEvent.click(getByText('เพิ่มผู้ป่วย'));
    expect(await findByText(/Server error/)).toBeInTheDocument();
  });

  it('resets form when modal is closed', async () => {
    const { getByText, getByLabelText } = renderForm(
      <AddPatientModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />
    );
    await fillBasicFields({ getByLabelText, getByText });
    fireEvent.click(getByText('ยกเลิก'));
    expect(onClose).toHaveBeenCalled();
    // reopen and expect empty
    const { getByLabelText: newGet } = renderForm(
      <AddPatientModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />
    );
    expect(newGet('ชื่อจริง').value).toBe('');
  });
});
