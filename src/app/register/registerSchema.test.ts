import '@testing-library/jest-dom/vitest';
import { registerSchema } from './RegisterForm';

describe('registerSchema validation', () => {
  const validData = {
    nationalId: '1234567890123',
    password: 'abcdef',
    confirmPassword: 'abcdef',
    prefix: 'นาย',
    firstName: 'สมชาย',
    lastName: 'ใจดี',
    phone: '0812345678',
    role: 'Community',
  };

  it('accepts valid data with role Community', () => {
    const result = registerSchema.safeParse(validData);
    expect(result.success).to.equal(true);
  });

  it('rejects data with invalid role', () => {
    const invalidData = { ...validData, role: 'Driver' };
    const result = registerSchema.safeParse(invalidData);
    expect(result.success).to.equal(false);
    if (!result.success) {
      const issues = result.error.issues.map((i) => i.message);
      expect(issues).to.include('เลือกกลุ่มผู้ใช้เป็น ประชาชนทั่วไป เท่านั้น');
    }
  });
});

