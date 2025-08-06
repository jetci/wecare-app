// Force rebuild
"use client";
'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { apiFetch } from '@/lib/api';

interface FormData {
  nationalId: string;      // ชื่อตรงกับ backend API
  password: string;
}

export default function LoginForm() {
  const { login } = useAuth();
  const [redirecting, setRedirecting] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>();
  const [errorMessage, setErrorMessage] = useState<string>('');
  const router = useRouter();
  const searchParams = useSearchParams();

  // This useEffect can be removed if old tokens are no longer a concern,
  // but is kept for now to ensure a clean slate during transition.
  useEffect(() => {
    localStorage.removeItem('accessToken');
  }, []);

  const onSubmit = async (data: FormData) => {
    setErrorMessage('');
    try {
      console.log('✅ [FORCE REBUILD] Submitting login form with:', data);
      console.log('--- LoginForm Debug Started ---');
      console.log('1. [BEFORE FETCH] Submitting with data:', data);

      const res = await fetch("/api/login", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });

      console.log('2. [AFTER FETCH] Response received. Status:', res.status, 'OK:', res.ok);

      if (!res.ok) {
        console.error('   [ERROR] Response not OK. Logging response text...');
        const errorJson = await res.json();
        const errorMessage = errorJson.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';

        if (res.status === 403) {
          throw new Error('บัญชียังไม่อนุมัติ');
        } else if (res.status === 401) {
          throw new Error('เลขบัตรประชาชนหรือรหัสผ่านไม่ถูกต้อง');
        } else {
          throw new Error(errorMessage);
        }
      }

      console.log('3. [BEFORE JSON PARSE] Attempting to parse response as JSON...');
      const json = await res.json();
      console.log('4. [AFTER JSON PARSE] Parsed JSON:', json);

      if (!json.success || !json.accessToken || !json.user) {
        throw new Error(json.message || 'Login response is missing required fields.');
      }

      const { accessToken, user } = json;
      console.log('5. [DATA EXTRACTED] Token and user object received:', { accessToken, user });

      // 1. Update authentication context
      console.log('6. [VERIFY BEFORE CALL] Verifying user object before calling login:', user);
      login(accessToken, user);

      // 2. Determine the redirect path based on user role
      const role = user.role;
      const roleToPath: Record<string, string> = {
        COMMUNITY: '/dashboard/community',
        DRIVER: '/dashboard/driver',
        OFFICER: '/dashboard/health-officer', // Note: Role in DB is OFFICER
        EXECUTIVE: '/dashboard/executive',
        ADMIN: '/dashboard/admin',
        DEVELOPER: '/dashboard/developer',
      };

      // Ensure role matching is case-insensitive by converting to uppercase
      const redirectPath = roleToPath[role.toUpperCase()] || '/dashboard/community'; // Fallback
      console.log(`6. [REDIRECTING] User role: ${role}, Path: ${redirectPath}`);

      // Redirection is now handled by AuthContext after login

      console.log('--- LoginForm Debug Finished ---');
    } catch (err: unknown) {
      // We keep console.error here for development debugging, 
      // but it can be removed in a production build process.
      console.error("Login Submit Error:", err);
      const message = err instanceof Error ? err.message : 'An unknown error occurred.';
      toast.error(message);
      setErrorMessage(message);
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-semibold mb-6 text-center">เข้าสู่ระบบ</h2>
        <div className="mb-4">
          <label htmlFor="nationalId" className="block text-gray-700">เลขบัตรประชาชน</label>
          <input
            id="nationalId"
            data-cy="login-citizenId"
            type="text"
            {...register('nationalId', { required: 'กรุณากรอกรหัสบัตรประชาชน' })}
            className="w-full mt-1 px-3 py-2 border rounded"
            placeholder="กรอกเลขบัตรประชาชน 13 หลัก"
            maxLength={13}
          />
          {errors.nationalId && <p className="text-red-500 text-sm">{errors.nationalId.message}</p>}
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700">รหัสผ่าน</label>
          <input
            id="password"
            data-cy="login-password"
            type="password"
            {...register('password', { required: 'กรุณากรอกรหัสผ่าน' })}
            className="w-full mt-1 px-3 py-2 border rounded"
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        </div>
        <button
          data-cy="login-submit"
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>
        {errorMessage && (
          <div role="alert" data-cy="login-error" className="mt-4 text-red-500 text-center">
            {errorMessage}
          </div>
        )}
        <p className="mt-4 text-center text-sm">
          ยังไม่มีบัญชี?{' '}
          <Link href="/register" className="text-blue-600 hover:underline">
            สมัครสมาชิก
          </Link>
        </p>
      </form>
    </div>
  );
}
