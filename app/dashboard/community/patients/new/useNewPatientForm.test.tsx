import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { useNewPatientForm } from './useNewPatientForm';
import { baseFormDefaults } from './formDefaults';

// Mock next/navigation useSearchParams to return empty params
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

describe('useNewPatientForm', () => {
  it('ค่าเริ่มต้นตรงกับ baseFormDefaults', () => {
    const { result } = renderHook(() => useNewPatientForm());
    expect(result.current.getValues()).toMatchObject({
      prefix: baseFormDefaults.prefix,
      firstName: baseFormDefaults.firstName,
      lastName: baseFormDefaults.lastName,
      email: baseFormDefaults.email,
      nationalId: baseFormDefaults.nationalId,
      phone: baseFormDefaults.phone,
    });
  });

  it('validates required fields and returns invalid state when empty', async () => {
    const { result } = renderHook(() => useNewPatientForm());
    await act(async () => {
      const isValid = await result.current.trigger();
      expect(isValid).to.equal(false);
    });
  });
});

