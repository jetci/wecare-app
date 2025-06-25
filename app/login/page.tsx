"use client";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';

const schema = z.object({
  citizenId: z.string()
    .length(13, 'รหัสประชาชนต้องมี 13 หลัก')
    .regex(/^[0-9]{13}$/, 'รหัสประชาชนต้องเป็นตัวเลข 13 หลัก'),

  password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
});

type FormData = z.infer<typeof schema>;



export default function LoginPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setErrorMessage(null);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ citizenId: data.citizenId, password: data.password })
      });
      if (res.ok) {
        router.push('/dashboard');
      } else {
        const err = await res.json();
        setErrorMessage(err.message || 'เกิดข้อผิดพลาด');
      }
    } catch {
      setErrorMessage('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">เข้าสู่ระบบ</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="citizenId" className="block text-sm font-medium text-gray-700">รหัสประชาชน</label>
            <input
              type="text"
              id="citizenId"
              {...register('citizenId')}
              className="mt-1 block w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            />
            {errors.citizenId && <p className="text-red-500 text-sm mt-1">{errors.citizenId.message}</p>}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">รหัสผ่าน</label>
            <input
              type="password"
              id="password"
              {...register('password')}
              className="mt-1 block w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>
          {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
      </div>
    </div>
  );
}



