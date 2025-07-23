import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { rest } from 'msw';
import { server } from '@/test/mocks/server';
import { renderForm } from '@/test/utils/formTestUtils';
import AddPatientModal from '@/components/community/AddPatientModal';

describe('AddPatientModal', () => {
  const onClose = vi.fn();
  const onSuccess = vi.fn();

  beforeEach(() => {
    onClose.mockClear();
    onSuccess.mockClear();
  });

  it('shows validation errors for empty form fields', async () => {
    const { getByText, submit } = renderForm(
      <AddPatientModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />
    );
    // submit without filling
    submit('เพิ่มผู้ป่วย');
    expect(await getByText('กรุณาเลือกคำนำหน้า')).toBeInTheDocument();
    expect(getByText('กรุณากรอกชื่อจริง')).toBeInTheDocument();
    expect(getByText('กรุณากรอกนามสกุล')).toBeInTheDocument();
  });

  it('blocks submit when nationalId invalid', async () => {
    const { getByLabelText, getByText } = renderForm(
      <AddPatientModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />
    );
    // fill required
    fireEvent.change(getByLabelText('เลขบัตรประชาชน'), { target: { value: '1234' } });
    fireEvent.blur(getByLabelText('เลขบัตรประชาชน'));
    expect(getByText('เลขบัตรประชาชนไม่ถูกต้อง')).toBeInTheDocument();
    // submit button disabled
    const btn = getByText('เพิ่มผู้ป่วย').closest('button');
    expect(btn).toBeDisabled();
  });

  it('submits form successfully with valid data', async () => {
    // mock POST
    server.use(
      rest.post('/api/patients', (req, res, ctx) => {
        return res(ctx.status(201), ctx.json({ id: 42 }));
      })
    );
    const { getByLabelText, getByText, findByText } = renderForm(
      <AddPatientModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />
    );
    // fill valid data
    fireEvent.change(getByLabelText('คำนำหน้า'), { target: { value: 'นาย' } });
    fireEvent.change(getByLabelText('ชื่อจริง'), { target: { value: 'Test' } });
    fireEvent.change(getByLabelText('นามสกุล'), { target: { value: 'User' } });
    fireEvent.change(getByLabelText('เลขบัตรประชาชน'), { target: { value: '1101700203451' } });
    // birthDate: picker
    // skip datepicker, assume default or manual set via setValue
    
    // submit
    fireEvent.click(getByText('เพิ่มผู้ป่วย'));
    expect(await findByText('เพิ่มข้อมูลผู้ป่วยสำเร็จ!')).toBeInTheDocument();
    expect(onSuccess).toHaveBeenCalled();
  });
});
