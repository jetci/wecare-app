"use client";
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DashboardLayout from '@/components/DashboardLayout';
import RoleGuard from '@/components/RoleGuard';
import MapPicker from '@/components/MapPicker';

const schema = z.object({
  prefix: z.enum(['Mr.', 'Mrs.', 'Miss'], { required_error: 'กรุณาเลือกคำนำหน้า' }),
  gender: z.enum(['Male', 'Female', 'Other'], { required_error: 'กรุณาเลือกเพศ' }),
  maritalStatus: z.enum(['Single', 'Married', 'Divorced', 'Widowed'], { required_error: 'กรุณาเลือกสถานภาพ' }),
  firstName: z.string().nonempty('กรุณากรอกชื่อ'),
  lastName: z.string().nonempty('กรุณากรอกนามสกุล'),
  citizenId: z.string().length(13, 'บัตรประชาชนต้องมี 13 หลัก'),
  bloodType: z.enum(['A', 'B', 'AB', 'O'], { required_error: 'กรุณาเลือกกรุ๊ปเลือด' }),
  birthDate: z.string().nonempty('กรุณาเลือกวันเกิด'),
  phoneNumber: z.string().regex(/^\d{10}$/, 'เบอร์โทรต้องมี 10 หลัก'),
  address: z.string().nonempty('กรุณากรอกที่อยู่'),
  location: z.object({ lat: z.number(), lng: z.number() }),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function AddPatientPage() {
  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      prefix: 'Mr.', gender: 'Male', maritalStatus: 'Single',
      firstName: '', lastName: '', citizenId: '', bloodType: 'O',
      birthDate: '2000-01-01', phoneNumber: '', address: '',
      location: { lat: 13.7367, lng: 100.5232 }, notes: '',
    }
  });

  const onSubmit = (data: FormData) => console.log(data);

  return (
    <RoleGuard>
      <DashboardLayout>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
          {/* Section 1: ข้อมูลเบื้องต้น */}
          <div className="bg-white p-4 rounded-lg shadow space-y-4">
            <h2 className="text-xl font-semibold">ข้อมูลเบื้องต้น</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm">คำนำหน้า</label>
                <select {...register('prefix')} className="border focus:ring rounded mt-1 text-sm w-full">
                  <option value="Mr.">Mr.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Miss">Miss</option>
                </select>
                {errors.prefix && <p className="text-red-500 text-sm">{errors.prefix.message}</p>}
              </div>
              <div>
                <label className="block text-sm">เพศ</label>
                <select {...register('gender')} className="border focus:ring rounded mt-1 text-sm w-full">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && <p className="text-red-500 text-sm">{errors.gender.message}</p>}
              </div>
              <div>
                <label className="block text-sm">สถานภาพ</label>
                <select {...register('maritalStatus')} className="border focus:ring rounded mt-1 text-sm w-full">
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
                {errors.maritalStatus && <p className="text-red-500 text-sm">{errors.maritalStatus.message}</p>}
              </div>
            </div>
          </div>

          {/* Section 2: ชื่อผู้ป่วย */}
          <div className="bg-white p-4 rounded-lg shadow space-y-4">
            <h2 className="text-xl font-semibold">ชื่อผู้ป่วย</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm">ชื่อ</label>
                <input {...register('firstName')} className="border focus:ring rounded mt-1 text-sm w-full" />
                {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="block text-sm">นามสกุล</label>
                <input {...register('lastName')} className="border focus:ring rounded mt-1 text-sm w-full" />
                {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}
              </div>
            </div>
          </div>

          {/* Section 3: บัตรประชาชน & กรุ๊ปเลือด */}
          <div className="bg-white p-4 rounded-lg shadow space-y-4">
            <h2 className="text-xl font-semibold">บัตรประชาชน & กรุ๊ปเลือด</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm">เลขบัตร 13 หลัก</label>
                <input {...register('citizenId')} maxLength={13} className="border focus:ring rounded mt-1 text-sm w-full" />
                {errors.citizenId && <p className="text-red-500 text-sm">{errors.citizenId.message}</p>}
              </div>
              <div>
                <label className="block text-sm">กรุ๊ปเลือด</label>
                <select {...register('bloodType')} className="border focus:ring rounded mt-1 text-sm w-full">
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="AB">AB</option>
                  <option value="O">O</option>
                </select>
                {errors.bloodType && <p className="text-red-500 text-sm">{errors.bloodType.message}</p>}
              </div>
            </div>
          </div>

          {/* Section 4: วันเกิด & เบอร์โทร */}
          <div className="bg-white p-4 rounded-lg shadow space-y-4">
            <h2 className="text-xl font-semibold">วันเกิด & เบอร์โทร</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm">วันเกิด</label>
                <input type="date" {...register('birthDate')} className="border focus:ring rounded mt-1 text-sm w-full" />
                {errors.birthDate && <p className="text-red-500 text-sm">{errors.birthDate.message}</p>}
              </div>
              <div>
                <label className="block text-sm">เบอร์โทร 10 หลัก</label>
                <input type="tel" {...register('phoneNumber')} className="border focus:ring rounded mt-1 text-sm w-full" />
                {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber.message}</p>}
              </div>
            </div>
          </div>

          {/* Section 5: ที่อยู่ */}
          <div className="bg-white p-4 rounded-lg shadow space-y-4">
            <h2 className="text-xl font-semibold">ที่อยู่</h2>
            <textarea {...register('address')} rows={3} className="border focus:ring rounded mt-1 text-sm w-full" />
            {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
          </div>

          {/* Section 6: ตำแหน่งแผนที่ & หมายเหตุ */}
          <div className="bg-white p-4 rounded-lg shadow space-y-4">
            <h2 className="text-xl font-semibold">ตำแหน่งแผนที่ & หมายเหตุ</h2>
            <div className="h-64 border rounded">
              <Controller
                control={control}
                name="location"
                render={({ field }) => (
                  <MapPicker
                    lat={field.value.lat}
                    lng={field.value.lng}
                    onDragEnd={(lat, lng) => field.onChange({ lat, lng })}
                  />
                )}
              />
            </div>
            <textarea {...register('notes')} rows={3} className="border focus:ring rounded mt-1 text-sm w-full" />
          </div>

          <div>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">บันทึกข้อมูล</button>
          </div>
        </form>
      </DashboardLayout>
    </RoleGuard>
  );
}
