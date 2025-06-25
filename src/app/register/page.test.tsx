import { vi, Mock } from 'vitest';

// Mock next/navigation
const mockRouterPush = vi.fn(); // This can be defined outside as its factory creates a closure
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    prefetch: vi.fn(),
    push: mockRouterPush,
  }),
}));

// Mock react-hot-toast as per SA instruction (factory returns object with 'default' key)
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  }
}));

// Mock global fetch
global.fetch = vi.fn() as Mock;

// Import 'toast' AFTER vi.mock('react-hot-toast', ...) has been processed
import toast from 'react-hot-toast';
// Get references to the mock functions from the imported mocked 'toast'
const toastSuccessMockFn = toast.success as Mock;
const toastErrorMockFn = toast.error as Mock;

// THEN OTHER STANDARD IMPORTS
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterPage from './page';

describe('Register Page', () => {
  beforeEach(() => {
    mockRouterPush.mockClear();
    toastSuccessMockFn.mockClear(); // Use new references
    toastErrorMockFn.mockClear();   // Use new references
    (global.fetch as Mock).mockClear();
    // Default fetch mock
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
      status: 200,
    } as Response);
  });

  it('renders the register page and form', () => {
    render(<RegisterPage />);
    expect(screen.getByRole('heading', { name: /สมัครสมาชิก/i })).toBeInTheDocument();
    // Check for key form fields
    expect(screen.getByLabelText(/คำนำหน้า/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^ชื่อ$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/นามสกุล/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/เลขบัตรประชาชน 13 หลัก/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^เบอร์โทรศัพท์$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^รหัสผ่าน$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^ยืนยันรหัสผ่าน$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/บทบาทผู้ใช้/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Captcha: \d+ \+ \d+ = \?/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /สมัครสมาชิก/i })).toBeInTheDocument();
  });

  describe('Validation', () => {
    it('shows an error if first name is empty', async () => {
      render(<RegisterPage />);
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /สมัครสมาชิก/i }));
      await waitFor(() => {
        expect(screen.getByText(/กรุณากรอกชื่อ/i)).toBeInTheDocument();
      });
    });

    it('shows an error if nationalId format is invalid', async () => {
      act(() => {
        render(<RegisterPage />);
      });
      const user = userEvent.setup();
      await user.type(screen.getByLabelText(/เลขบัตรประชาชน 13 หลัก/i), '123');
      // Fill other required fields to ensure only nationalId validation is triggered
      await user.selectOptions(screen.getByLabelText(/คำนำหน้า/i), 'นาย');
      await user.type(screen.getByLabelText(/^ชื่อ$/i), 'ทดสอบ');
      await user.type(screen.getByLabelText(/นามสกุล/i), 'ผู้ใช้');
      await user.type(screen.getByLabelText(/^เบอร์โทรศัพท์$/i), '0800000000');
      await user.type(screen.getByLabelText(/^รหัสผ่าน$/i), 'Password123!');
      await user.type(screen.getByLabelText(/^ยืนยันรหัสผ่าน$/i), 'Password123!');
      await user.selectOptions(screen.getByLabelText(/บทบาทผู้ใช้/i), 'COMMUNITY');
      const captchaLabelText = screen.getByText(/Captcha: \d+ \+ \d+ = \?/i).textContent || '';
      const match = captchaLabelText.match(/(\d+)\s*\+\s*(\d+)/);
      if (match) {
        const sum = parseInt(match[1]) + parseInt(match[2]);
        await user.type(screen.getByLabelText(/Captcha: \d+ \+ \d+ = \?/i), sum.toString());
      }

      await user.click(screen.getByRole('button', { name: /สมัครสมาชิก/i }));
      await waitFor(() => {
        expect(screen.getByText(/เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก/i)).toBeInTheDocument();
      });
    });

    it('shows an error if password is too short (less than 6 characters)', async () => {
      act(() => {
        render(<RegisterPage />);
      });
      const user = userEvent.setup();
      await user.type(screen.getByLabelText(/^รหัสผ่าน$/i), 'short'); // Less than 6 chars
      await user.click(screen.getByRole('button', { name: /สมัครสมาชิก/i }));
      await waitFor(() => {
        expect(screen.getByText(/รหัสผ่านต้องอย่างน้อย 6 ตัว/i)).toBeInTheDocument();
      });
    });

    it('shows an error if password does not meet strength requirements (e.g., missing number/symbol)', async () => {
      act(() => {
        render(<RegisterPage />);
      });
      const user = userEvent.setup();
      await user.type(screen.getByLabelText(/^รหัสผ่าน$/i), 'passwordwithoutsymbols'); // Missing symbol and number
      await user.click(screen.getByRole('button', { name: /สมัครสมาชิก/i }));
      await waitFor(() => {
        expect(screen.getByText(/ต้องมีตัวเลขและสัญลักษณ์/i)).toBeInTheDocument();
      });
    });

    it('shows an error if passwords do not match', async () => {
      render(<RegisterPage />);
      const user = userEvent.setup();
      // Fill other required fields with valid data
      await user.selectOptions(screen.getByLabelText(/คำนำหน้า/i), 'นาย');
      await user.type(screen.getByLabelText(/^ชื่อ$/i), 'ทดสอบ');
      await user.type(screen.getByLabelText(/นามสกุล/i), 'ผู้ใช้');
      await user.type(screen.getByLabelText(/เลขบัตรประชาชน 13 หลัก/i), '1234567890123');
      await user.type(screen.getByLabelText(/^เบอร์โทรศัพท์$/i), '0800000000');
      await user.selectOptions(screen.getByLabelText(/บทบาทผู้ใช้/i), 'COMMUNITY');

      // Solve Captcha
      const captchaLabelText = screen.getByText(/Captcha: \d+ \+ \d+ = \?/i).textContent || '';
      const match = captchaLabelText.match(/(\d+)\s*\+\s*(\d+)/);
      let captchaInput = '';
      if (match) {
        const numericSum = parseInt(match[1]) + parseInt(match[2]);
        captchaInput = numericSum.toString();
        await user.type(screen.getByLabelText(/Captcha: \d+ \+ \d+ = \?/i), captchaInput);
      }

      // Now, set mismatching passwords
      await user.type(screen.getByLabelText(/^รหัสผ่าน$/i), 'Password123!');
      await user.type(screen.getByLabelText(/^ยืนยันรหัสผ่าน$/i), 'PasswordDoesNotMatch123!'); // Different password
      
      await user.click(screen.getByRole('button', { name: /สมัครสมาชิก/i }));

      await waitFor(() => {
        expect(screen.getByText(/รหัสผ่านไม่ตรงกัน/i)).toBeInTheDocument();
      });
    });
  });

  describe('Submission', () => {
    it('calls the register handler on successful submission', async () => {
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'User registered successfully' }), // Adjust based on actual API response
        status: 201,
      } as Response);

      render(<RegisterPage />);
      const user = userEvent.setup();
      
      // Fill form data
      await user.selectOptions(screen.getByLabelText(/คำนำหน้า/i), 'นาย');
      await user.type(screen.getByLabelText(/^ชื่อ$/i), 'ทดสอบชื่อ');
      await user.type(screen.getByLabelText(/นามสกุล/i), 'ทดสอบนามสกุล');
      const nationalId = '1234567890123';
      await user.type(screen.getByLabelText(/เลขบัตรประชาชน 13 หลัก/i), nationalId);
      await user.type(screen.getByLabelText(/^เบอร์โทรศัพท์$/i), '0812345678');
      const password = 'Password123!';
      await user.type(screen.getByLabelText(/^รหัสผ่าน$/i), password);
      await user.type(screen.getByLabelText(/^ยืนยันรหัสผ่าน$/i), password);
      await user.selectOptions(screen.getByLabelText(/บทบาทผู้ใช้/i), 'COMMUNITY');

      // Handle Captcha
      const captchaLabelText = screen.getByText(/Captcha: \d+ \+ \d+ = \?/i).textContent || '';
      const match = captchaLabelText.match(/(\d+)\s*\+\s*(\d+)/);
      let captchaValue = '';
      if (match) {
        captchaValue = (parseInt(match[1]) + parseInt(match[2])).toString();
        await user.type(screen.getByLabelText(/Captcha: \d+ \+ \d+ = \?/i), captchaValue);
      }

      await user.click(screen.getByRole('button', { name: /สมัครสมาชิก/i }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/auth/register', expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prefix: 'นาย',
            firstName: 'ทดสอบชื่อ',
            lastName: 'ทดสอบนามสกุล',
            nationalId,
            phone: '0812345678',
            password,
            confirmPassword: password,
            role: 'COMMUNITY',
            captcha: captchaValue,
            gender: 'ชาย' // Derived from prefix 'นาย'
          }),
        }));
        expect(toastSuccessMockFn).toHaveBeenCalledWith('สมัครสมาชิกสำเร็จ');
        expect(mockRouterPush).toHaveBeenCalledWith('/login');
      });
    });

    it('shows an error message if nationalId is already taken', async () => {
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'nationalId exists' }),
        status: 400, // Or appropriate error status for this case
      } as Response);

      render(<RegisterPage />);
      const user = userEvent.setup();
      
      // Fill form data
      await user.selectOptions(screen.getByLabelText(/คำนำหน้า/i), 'นางสาว');
      await user.type(screen.getByLabelText(/^ชื่อ$/i), 'สมหญิง');
      await user.type(screen.getByLabelText(/นามสกุล/i), 'ใจดี');
      await user.type(screen.getByLabelText(/เลขบัตรประชาชน 13 หลัก/i), '1102001234567');
      await user.type(screen.getByLabelText(/^เบอร์โทรศัพท์$/i), '0812345678');
      await user.type(screen.getByLabelText(/^รหัสผ่าน$/i), 'ValidPass123!');
      await user.type(screen.getByLabelText(/^ยืนยันรหัสผ่าน$/i), 'ValidPass123!');
      await user.selectOptions(screen.getByLabelText(/บทบาทผู้ใช้/i), 'COMMUNITY');

      // Solve Captcha
      const captchaLabelText = screen.getByText(/Captcha: \d+ \+ \d+ = \?/i).textContent || '';
      const match = captchaLabelText.match(/(\d+)\s*\+\s*(\d+)/);
      let captchaInput = '';
      if (match) {
        const numericSum = parseInt(match[1]) + parseInt(match[2]);
        captchaInput = numericSum.toString();
        await user.type(screen.getByLabelText(/Captcha: \d+ \+ \d+ = \?/i), captchaInput);
      }

      await user.click(screen.getByRole('button', { name: /สมัครสมาชิก/i }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/auth/register', expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prefix: 'นางสาว',
            firstName: 'สมหญิง',
            lastName: 'ใจดี',
            nationalId: '1102001234567',
            phone: '0812345678',
            password: 'ValidPass123!',
            confirmPassword: 'ValidPass123!',
            role: 'COMMUNITY',
            captcha: captchaInput,
            gender: 'หญิง' // Derived from prefix 'นางสาว'
          }),
        }));
        expect(screen.getByText(/เลขบัตรประชาชนนี้ได้ลงทะเบียนแล้ว/i)).toBeInTheDocument();
      });
    });

    it('shows an error message if nationalId is already taken', async () => {
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'nationalId exists' }),
        status: 400, // Or appropriate error status for this case
      } as Response);

      render(<RegisterPage />);
      const user = userEvent.setup();
      
      // Fill form data
      await user.selectOptions(screen.getByLabelText(/คำนำหน้า/i), 'นาย');
      await user.type(screen.getByLabelText(/^ชื่อ$/i), 'ผู้ใช้ซ้ำ');
      await user.type(screen.getByLabelText(/นามสกุล/i), 'ระบบ');
      await user.type(screen.getByLabelText(/เลขบัตรประชาชน 13 หลัก/i), '9876543210123'); // This ID will be 'taken'
      await user.type(screen.getByLabelText(/^เบอร์โทรศัพท์$/i), '0899999999');
      await user.type(screen.getByLabelText(/^รหัสผ่าน$/i), 'PasswordSecure1!');
      await user.type(screen.getByLabelText(/^ยืนยันรหัสผ่าน$/i), 'PasswordSecure1!');
      await user.selectOptions(screen.getByLabelText(/บทบาทผู้ใช้/i), 'ADMIN');

      // Solve Captcha
      const captchaLabelText = screen.getByText(/Captcha: \d+ \+ \d+ = \?/i).textContent || '';
      const match = captchaLabelText.match(/(\d+)\s*\+\s*(\d+)/);
      let captchaInput = '';
      if (match) {
        const numericSum = parseInt(match[1]) + parseInt(match[2]);
        captchaInput = numericSum.toString();
        await user.type(screen.getByLabelText(/Captcha: \d+ \+ \d+ = \?/i), captchaInput);
      }

      await user.click(screen.getByRole('button', { name: /สมัครสมาชิก/i }));

      await waitFor(() => {
        expect(screen.getByText(/เลขบัตรประชาชนนี้ได้ลงทะเบียนแล้ว/i)).toBeInTheDocument();
      });
    });
  });

  // Add more tests for responsive design if specific elements change or appear/disappear
  it('should be responsive (placeholder test)', () => {
    render(<RegisterPage />); 
    expect(true).toBe(true); // Replace with actual assertions
  });
});
