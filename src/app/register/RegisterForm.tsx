'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export const registerSchema = z.object({
  nationalId: z.string().length(13, 'กรุณาใส่เลขบัตรประชาชน 13 หลัก'),
  password: z.string().min(6, 'รหัสผ่านต้องอย่างน้อย 6 ตัวอักษร'),
  confirmPassword: z.string(),
  prefix: z.string().nonempty('เลือกคำนำหน้า'),
  firstName: z.string().nonempty('กรุณาใส่ชื่อ'),
  lastName: z.string().nonempty('กรุณาใส่นามสกุล'),
  phone: z.string().min(9, 'กรุณาใส่เบอร์โทรศัพท์'),
  role: z.enum(['Community'], { errorMap: () => ({ message: 'เลือกกลุ่มผู้ใช้เป็น ประชาชนทั่วไป เท่านั้น' }) }),
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'รหัสผ่านไม่ตรงกัน',
});

type RegisterData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'Community' },
  });

  const onSubmit = async (data: RegisterData) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) router.push('/login');
      else {
        const json = await res.json();
        alert(json.error || 'เกิดข้อผิดพลาด');
      }
    } catch {
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md mx-auto p-4 bg-white rounded shadow">
      <div>
        <label className="block font-medium">เลขบัตรประชาชน</label>
        <input type="text" {...register('nationalId')} className="w-full border p-2 rounded" />
        {errors.nationalId && <p className="text-red-500">{errors.nationalId.message}</p>}
      </div>
      <div>
        <label className="block font-medium">รหัสผ่าน</label>
        <input type="password" {...register('password')} className="w-full border p-2 rounded" />
        {errors.password && <p className="text-red-500">{errors.password.message}</p>}
      </div>
      <div>
        <label className="block font-medium">ยืนยันรหัสผ่าน</label>
        <input type="password" {...register('confirmPassword')} className="w-full border p-2 rounded" />
        {errors.confirmPassword && <p className="text-red-500">{errors.confirmPassword.message}</p>}
      </div>
      <div>
        <label className="block font-medium">คำนำหน้า</label>
        <select {...register('prefix')} className="w-full border p-2 rounded">
          <option value="">เลือกคำนำหน้า</option>
          <option value="นาย">นาย</option>
          <option value="นาง">นาง</option>
          <option value="นางสาว">นางสาว</option>
          <option value="เด็กชาย">เด็กชาย</option>
          <option value="เด็กหญิง">เด็กหญิง</option>
        </select>
        {errors.prefix && <p className="text-red-500">{errors.prefix.message}</p>}
      </div>
      <div>
        <label className="block font-medium">ชื่อ</label>
        <input type="text" {...register('firstName')} className="w-full border p-2 rounded" />
        {errors.firstName && <p className="text-red-500">{errors.firstName.message}</p>}
      </div>
      <div>
        <label className="block font-medium">นามสกุล</label>
        <input type="text" {...register('lastName')} className="w-full border p-2 rounded" />
        {errors.lastName && <p className="text-red-500">{errors.lastName.message}</p>}
      </div>
      <div>
        <label className="block font-medium">เบอร์โทรศัพท์</label>
        <input type="text" {...register('phone')} className="w-full border p-2 rounded" />
        {errors.phone && <p className="text-red-500">{errors.phone.message}</p>}
      </div>
            <input type="hidden" value="Community" {...register('role')} />
      <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white p-2 rounded">
        {isSubmitting ? 'กำลังส่ง...' : 'ลงทะเบียน'}
      </button>
    </form>
  );
}
