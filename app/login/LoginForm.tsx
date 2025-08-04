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

  useEffect(() => {
    localStorage.removeItem('accessToken');
    document.cookie = 'refreshToken=; path=/; max-age=0';
  }, []);

  const onSubmit = async (data: FormData) => {
    setErrorMessage('');
    try {
      const res = await apiFetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || json.message || 'Login failed');
      login(json.accessToken);
      document.cookie = `accessToken=${json.accessToken}; path=/; SameSite=Lax; max-age=${7*24*60*60}`;
      if (json.refreshToken) {
        document.cookie = `refreshToken=${json.refreshToken}; path=/; SameSite=Lax; max-age=${7*24*60*60}`;
      }
      setRedirecting(true);
      // Redirect intelligently based on original destination
      const callbackUrl = searchParams.get('callbackUrl');
      // Avoid default root redirect: if callbackUrl is exactly '/dashboard', use role-specific instead
      const dest = callbackUrl && callbackUrl !== '/dashboard'
        ? callbackUrl
        : `/dashboard/${json.user.role.toLowerCase()}`;
      router.push(dest);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด';
      setErrorMessage(message);
    }
  };

  if (redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-lg">
        กำลังไปยังหน้า Dashboard ตามบทบาท...
      </div>
    );
  }

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
