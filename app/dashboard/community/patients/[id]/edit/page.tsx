"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Zod schema for patient validation
const patientSchema = z.object({
  prefix: z.string().nonempty("กรุณากรอกคำนำหน้า"),
  firstName: z.string().nonempty("กรุณากรอกชื่อ"),
  lastName: z.string().nonempty("กรุณากรอกนามสกุล"),
  phone: z.string().nonempty("กรุณากรอกเบอร์โทรศัพท์").regex(/^[0-9]{9,10}$/, "เบอร์โทรศัพท์ไม่ถูกต้อง"),
});
export type Patient = z.infer<typeof patientSchema>;

export default function EditPatientPage() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get('id');
  const methods = useForm<Patient>({
    resolver: zodResolver(patientSchema),
    defaultValues: { prefix: '', firstName: '', lastName: '', phone: '' },
  });
  const { register, handleSubmit, reset } = methods;
  const { errors } = methods.formState;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/patients/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Fetch failed');
        return res.json();
      })
      .then((data) => {
        reset(data.patient);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, reset]);

  const onSubmit = async (data: Patient) => {
    if (!id) return;
    setLoading(true);
    const res = await fetch(`/api/patients/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setLoading(false);
    if (res.ok) {
      router.push('/dashboard/community/patients');
    } else {
      setError('Update failed');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <FormProvider {...methods}>
      <h1>แก้ไขข้อมูลผู้ป่วย</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label htmlFor="prefix">คำนำหน้า</label>
        <input id="prefix" {...register('prefix')} />
        {errors.prefix && <p className="text-red-500 text-sm">{errors.prefix.message}</p>}

        <label htmlFor="firstName">ชื่อ</label>
        <input id="firstName" {...register('firstName')} />
        {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}

        <label htmlFor="lastName">นามสกุล</label>
        <input id="lastName" {...register('lastName')} />
        {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}

        <label htmlFor="phone">เบอร์โทรศัพท์</label>
        <input id="phone" {...register('phone')} />
        {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}

        <button type="submit">บันทึก</button>
      </form>
    </FormProvider>
  );
}
