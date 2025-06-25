import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AreaForm from './AreaForm';
import { vi } from 'vitest';

describe('AreaForm', () => {
  it('แสดงข้อความ error เมื่อ input ว่าง', async () => {
    const onSuccess = vi.fn();
    render(<AreaForm onSuccess={onSuccess} />);

    // ล้างค่า input fields
    const provinceInput = screen.getByLabelText(/จังหวัด/);
    fireEvent.change(provinceInput, { target: { value: '' } });
    const districtInput = screen.getByLabelText(/อำเภอ/);
    fireEvent.change(districtInput, { target: { value: '' } });
    const subdistrictInput = screen.getByLabelText(/ตำบล/);
    fireEvent.change(subdistrictInput, { target: { value: '' } });

    // กดปุ่ม submit
    const submitButton = screen.getByRole('button', { name: /สร้าง/ });
    fireEvent.click(submitButton);

    // รอและตรวจสอบ error messages
    await waitFor(() => {
      expect(screen.getByText('กรุณากรอกจังหวัด')).toBeInTheDocument();
      expect(screen.getByText('กรุณากรอกอำเภอ')).toBeInTheDocument();
      expect(screen.getByText('กรุณากรอกตำบล')).toBeInTheDocument();
    });

    expect(onSuccess).not.toHaveBeenCalled();
  });
});
