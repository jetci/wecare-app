import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '../app/(auth)/login/page';
import RegisterPage from '../app/(auth)/register/page';

// Mock Next.js router
const mockRouter = {
  push: vi.fn(),
};
vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

// Mock fetch
global.fetch = vi.fn();

function createFetchResponse(ok: boolean, data: any) {
  return { ok, json: () => new Promise((resolve) => resolve(data)) };
}

describe('Authentication Forms', () => {
  
  // --- Login Page Tests ---
  describe('Login Page', () => {
    it('renders login form correctly', () => {
      render(<LoginPage />);
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    it('shows an error on failed login', async () => {
      (fetch as any).mockResolvedValue(createFetchResponse(false, { error: 'Invalid credentials' }));

      render(<LoginPage />);
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } });
      fireEvent.click(screen.getByRole('button', { name: /login/i }));

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });
    });

    it('redirects on successful login', async () => {
        (fetch as any).mockResolvedValue(createFetchResponse(true, { role: 'ADMIN' }));
  
        render(<LoginPage />);
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'admin@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: /login/i }));
  
        await waitFor(() => {
          expect(mockRouter.push).toHaveBeenCalledWith('/admin/dashboard');
        });
      });
  });

  // --- Register Page Tests ---
  describe('Register Page', () => {
    it('renders register form correctly', () => {
      render(<RegisterPage />);
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('redirects to login on successful registration', async () => {
        (fetch as any).mockResolvedValue(createFetchResponse(true, {}));

        render(<RegisterPage />);
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'newuser@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'newpassword123' } });
        fireEvent.click(screen.getByRole('button', { name: /register/i }));

        await waitFor(() => {
            expect(mockRouter.push).toHaveBeenCalledWith('/login');
        });
    });
  });
});
