"use client";
import React from 'react';
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useEffect } from 'react';
import { apiFetch } from '@/lib/api';

interface FormData {
  nationalId: string;
  password: string;
}

export default function LoginForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>();
  const router = useRouter();

  // clear tokens on login page mount
  useEffect(() => {
    localStorage.removeItem('accessToken');
    document.cookie = 'refreshToken=; path=/; max-age=0';
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Login failed');
      localStorage.setItem('accessToken', json.accessToken);
      // set accessToken cookie for middleware
      document.cookie = `accessToken=${json.accessToken}; path=/; SameSite=Lax; max-age=${7*24*60*60}`;
      // and refreshToken in cookie if provided
      if (json.refreshToken) {
        document.cookie = `refreshToken=${json.refreshToken}; path=/; SameSite=Lax; max-age=${7*24*60*60}`;
      }
      router.push(`/dashboard/${json.user.role.toLowerCase()}`);
    } catch (err: any) {
      toast.error(err.message || 'เกิดข้อผิดพลาด');
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
            type="password"
            {...register('password', { required: 'กรุณากรอกรหัสผ่าน' })}
            className="w-full mt-1 px-3 py-2 border rounded"
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>
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
