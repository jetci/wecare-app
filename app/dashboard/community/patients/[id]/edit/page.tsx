"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PatientProfileSchema, PatientProfileForm } from '@/schemas/patientProfile.schema';

export default function EditPatientPage() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get('id');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PatientProfileForm>({
    resolver: zodResolver(PatientProfileSchema),
    defaultValues: {
      fullName: '',
      hospitalNumber: '',
      nationalId: '',
      birthDate: '',
      allergies: [],
      chronicDiseases: [],
      emergencyContact: { name: '', phone: '' },
    },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/patients/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Fetch failed');
        return res.json();
      })
      .then((data) => reset(data.patient))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, reset]);

  const onSubmit = async (data: PatientProfileForm) => {
    if (!id) return;
    setLoading(true);
    const res = await fetch(`/api/patients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setLoading(false);
    if (res.ok) {
      router.push('/dashboard/community/patients');
    } else {
      const err = await res.json();
      setError(err.error || 'Update failed');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">แก้ไขข้อมูลผู้ป่วย</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="fullName">ชื่อ-นามสกุล</label>
          <input id="fullName" {...register('fullName')} />
          {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}
        </div>
        <div>
          <label htmlFor="hospitalNumber">หมายเลขโรงพยาบาล</label>
          <input id="hospitalNumber" {...register('hospitalNumber')} />
          {errors.hospitalNumber && <p className="text-red-500 text-sm">{errors.hospitalNumber.message}</p>}
        </div>
        <div>
          <label htmlFor="nationalId">เลขบัตรประชาชน</label>
          <input id="nationalId" {...register('nationalId')} />
          {errors.nationalId && <p className="text-red-500 text-sm">{errors.nationalId.message}</p>}
        </div>
        <div>
          <label htmlFor="birthDate">วันเกิด</label>
          <input type="date" id="birthDate" {...register('birthDate')} />
          {errors.birthDate && <p className="text-red-500 text-sm">{errors.birthDate.message}</p>}
        </div>
        <div>
          <label htmlFor="allergies">แพ้ยา (คั่นด้วยคอมม่า)</label>
          <input
            id="allergies"
            {...register('allergies', {
              setValueAs: (v) =>
                typeof v === 'string'
                  ? v.split(',').map((s) => s.trim()).filter(Boolean)
                  : [],
            })}
          />
          {errors.allergies && <p className="text-red-500 text-sm">{errors.allergies.message}</p>}
        </div>
        <div>
          <label htmlFor="chronicDiseases">โรคประจำตัว (คั่นด้วยคอมม่า)</label>
          <input
            id="chronicDiseases"
            {...register('chronicDiseases', {
              setValueAs: (v) =>
                typeof v === 'string'
                  ? v.split(',').map((s) => s.trim()).filter(Boolean)
                  : [],
            })}
          />
          {errors.chronicDiseases && <p className="text-red-500 text-sm">{errors.chronicDiseases.message}</p>}
        </div>
        <div>
          <label htmlFor="emergencyName">ชื่อผู้ติดต่อฉุกเฉิน</label>
          <input id="emergencyName" {...register('emergencyContact.name')} />
          {errors.emergencyContact?.name && (
            <p className="text-red-500 text-sm">{errors.emergencyContact.name.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="emergencyPhone">เบอร์ผู้ติดต่อฉุกเฉิน</label>
          <input id="emergencyPhone" {...register('emergencyContact.phone')} />
          {errors.emergencyContact?.phone && (
            <p className="text-red-500 text-sm">{errors.emergencyContact.phone.message}</p>
          )}
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
          บันทึก
        </button>
      </form>
    </div>
  );
}
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PatientProfileSchema, PatientProfileForm } from '@/schemas/patientProfile.schema';
import { useRouter, useSearchParams } from 'next/navigation';

import { PatientProfileSchema, PatientProfileForm } from '@/schemas/patientProfile.schema';
import { zodResolver } from '@hookform/resolvers/zod'; // resolver for patient profile schema


// Using PatientProfileSchema for validation
const patientSchema = PatientProfileSchema; // placeholder, remove manual schema
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
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PatientProfileForm>({
    resolver: zodResolver(PatientProfileSchema),
  });
    resolver: zodResolver(patientSchema),
    defaultValues: { prefix: '', firstName: '', lastName: '', phone: '' },
  });
  
  
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
    <>
      <h1>แก้ไขข้อมูลผู้ป่วย</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
                {/* Full Name */}
        <label htmlFor="fullName">ชื่อ-นามสกุล</label>
        <input id="fullName" {...register('fullName')} />
        {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}

        {/* Hospital Number */}
        <label htmlFor="hospitalNumber">หมายเลขโรงพยาบาล</label>
        <input id="hospitalNumber" {...register('hospitalNumber')} />
        {errors.hospitalNumber && <p className="text-red-500 text-sm">{errors.hospitalNumber.message}</p>}

        {/* National ID */}
        <label htmlFor="nationalId">เลขบัตรประชาชน</label>
        <input id="nationalId" {...register('nationalId')} />
        {errors.nationalId && <p className="text-red-500 text-sm">{errors.nationalId.message}</p>}

        {/* Birth Date */}
        <label htmlFor="birthDate">วันเกิด</label>
        <input type="date" id="birthDate" {...register('birthDate')} />
        {errors.birthDate && <p className="text-red-500 text-sm">{errors.birthDate.message}</p>}

        {/* Allergies */}
        <label htmlFor="allergies">แพ้ยา (คั่นด้วยคอมม่า)</label>
        <input id="allergies" {...register('allergies', { setValueAs: v => (typeof v === 'string' ? v.split(',').map(s=>s.trim()).filter(Boolean) : []) })} />
        {errors.allergies && <p className="text-red-500 text-sm">{errors.allergies.message}</p>}

        {/* Chronic Diseases */}
        <label htmlFor="chronicDiseases">โรคประจำตัว (คั่นด้วยคอมม่า)</label>
        <input id="chronicDiseases" {...register('chronicDiseases', { setValueAs: v => (typeof v === 'string' ? v.split(',').map(s=>s.trim()).filter(Boolean) : []) })} />
        {errors.chronicDiseases && <p className="text-red-500 text-sm">{errors.chronicDiseases.message}</p>}

        {/* Emergency Contact */}
        <label htmlFor="emergencyName">ชื่อผู้ติดต่อฉุกเฉิน</label>
        <input id="emergencyName" {...register('emergencyContact.name')} />
        {errors.emergencyContact?.name && <p className="text-red-500 text-sm">{errors.emergencyContact.name.message}</p>}

        <label htmlFor="emergencyPhone">เบอร์ผู้ติดต่อฉุกเฉิน</label>
        <input id="emergencyPhone" {...register('emergencyContact.phone')} />
        {errors.emergencyContact?.phone && <p className="text-red-500 text-sm">{errors.emergencyContact.phone.message}</p>}

        <button type="submit">บันทึก</button>
      </form>
    </>
  );
}
