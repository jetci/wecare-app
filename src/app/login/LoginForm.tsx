'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/apiFetch';
import toast from 'react-hot-toast';
import { z } from 'zod';

// Zod schema for validation
const LoginSchema = z.object({
  nationalId: z.string().length(13, { message: 'รหัสประจำตัวประชาชนต้องมี 13 หลัก' }),
  password: z.string().min(1, { message: 'กรุณากรอกรหัสผ่าน' }),
});

type FormData = z.infer<typeof LoginSchema>;

export default function LoginForm() {
  const [formData, setFormData] = useState<FormData>({
    nationalId: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log('[Login] handleSubmit function triggered.'); // DEV.16: Check if function is called
    e.preventDefault();
    setError(null);

    const validationResult = LoginSchema.safeParse(formData);
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors[0].message;
      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Login successful:', data);
        toast.success('เข้าสู่ระบบสำเร็จ กำลังนำท่านไปยังหน้าหลัก');

        // DEV.16: Add detailed logs for token lifecycle
        console.log('[LoginForm] Step 1: Attempting to set token in localStorage.');
        localStorage.setItem('accessToken', data.accessToken);
        console.log('[Login] Token set in localStorage:', data.accessToken); // DEV.15 Log

        console.log('[LoginForm] Step 2: Dispatching authChange event.');
        window.dispatchEvent(new CustomEvent('authChange'));

        // Add a small delay to ensure AuthContext has time to update after redirect
        await new Promise(resolve => setTimeout(resolve, 150));
        console.log('[LoginForm] Step 3: Delay finished, preparing to redirect.');

        // Redirect based on role
        const roleToPath: Record<string, string> = {
          COMMUNITY: '/dashboard/community',
          DRIVER: '/dashboard/driver',
          OFFICER: '/dashboard/health-officer',
          EXECUTIVE: '/dashboard/executive',
          ADMIN: '/dashboard/admin',
          DEVELOPER: '/dashboard/developer',
        };
        const redirectPath = roleToPath[data.user.role.toUpperCase()] || '/dashboard/community';
        console.log('[Login] Before redirecting to:', redirectPath);
        router.push(redirectPath);
        console.log('[Login] After router.push call');

      } else {
        console.error('Login failed:', data.message);
        const errorMessage = data.message || 'รหัสประจำตัวหรือรหัสผ่านไม่ถูกต้อง';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err: any) {
      console.error('An unexpected error occurred:', err);
      const errorMessage = err.message || 'เกิดข้อผิดพลาดที่ไม่คาดคิด';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="nationalId"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          รหัสประจำตัวประชาชน
        </label>
        <div className="mt-2">
          <input
            id="nationalId"
            name="nationalId"
            type="text"
            maxLength={13}
            value={formData.nationalId}
            onChange={handleChange}
            required
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            รหัสผ่าน
          </label>
        </div>
        <div className="mt-2">
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div>
        <button
          type="submit"
          disabled={loading}
          className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
        >
          {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>
      </div>
    </form>
  );
}
