"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { th } from 'date-fns/locale/th';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DatePicker, { registerLocale } from 'react-datepicker';
import * as localeTh from 'date-fns/locale/th';
import 'react-datepicker/dist/react-datepicker.css';
import { PatientProfileForm, PatientProfileSchema } from '@/schemas/patientProfile.schema';

// Configure Thai locale for DatePicker
const thLocale = 'default' in localeTh ? (localeTh as any).default : localeTh;
registerLocale('th', thLocale);

// Helper: format Date to 'dd-MM-yyyy' Buddhist year
import { th } from 'date-fns/locale/th';
import { useForm, Controller } from 'react-hook-form';
import DatePicker, { registerLocale } from 'react-datepicker';
import * as localeTh from 'date-fns/locale/th';
import 'react-datepicker/dist/react-datepicker.css';

// Configure Thai locale for DatePicker
const thLocale = 'default' in localeTh ? (localeTh as any).default : localeTh;
registerLocale('th', thLocale);

// Helper: format Date to 'dd-MM-yyyy' Buddhist year
function toBuddhistDateString(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear() + 543;
  return `${dd}-${mm}-${yyyy}`;
}

// Helper: parse 'dd-MM-yyyy' Buddhist year to Date or null
function parseBuddhistDate(value: string): Date | null {
  const [dd, mm, yyyy] = value.split('-').map(Number);
  if (!dd || !mm || !yyyy) return null;
  return new Date(yyyy - 543, mm - 1, dd);
}
import { Controller } from 'react-hook-form';
import DatePicker, { registerLocale } from 'react-datepicker';
import * as localeTh from 'date-fns/locale/th';
import 'react-datepicker/dist/react-datepicker.css';

// Configure Thai locale for DatePicker
const thLocale = 'default' in localeTh ? (localeTh as any).default : localeTh;
registerLocale('th', thLocale);

// Helper: format Date to 'dd-MM-yyyy' Buddhist year
function toBuddhistDateString(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear() + 543;
  return `${dd}-${mm}-${yyyy}`;
}

// Helper: parse 'dd-MM-yyyy' Buddhist year to Date or null
function parseBuddhistDate(value: string): Date | null {
  const [dd, mm, yyyy] = value.split('-').map(Number);
  if (!dd || !mm || !yyyy) return null;
  return new Date(yyyy - 543, mm - 1, dd);
}
import { Controller } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Helper: format Date to 'dd-MM-yyyy' Buddhist year
function toBuddhistDateString(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear() + 543;
  return `${dd}-${mm}-${yyyy}`;
}

// Helper: parse 'dd-MM-yyyy' Buddhist year to Date or null
function parseBuddhistDate(value: string): Date | null {
  const [dd, mm, yyyy] = value.split('-').map(Number);
  if (!dd || !mm || !yyyy) return null;
  return new Date(yyyy - 543, mm - 1, dd);
}

() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get('id');

  const { register, handleSubmit, reset, watch, control, formState: { errors } } = useForm<PatientProfileForm>({
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

  const formatBuddhist = (date: Date) =>
    format(date, 'dd MMMM yyyy', { locale: th }).replace(/\d{4}$/, y => String(Number(y) + 543));

  useEffect(() => {
    if (!id) return;
    fetch(`/api/patients/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Fetch failed');
        return res.json();
      })
      .then(data => reset(data.patient))
      .catch(err => setError(err.message))
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
          <Controller
            control={control}
            name="birthDate"
            render={({ field }) => (
              <DatePicker
                {...field}
                locale="th"
                dateFormat="dd-MM-yyyy"
                selected={field.value ? parseBuddhistDate(field.value) : null}
                onChange={(date: Date | null) => field.onChange(date ? toBuddhistDateString(date) : '')}
                className="border p-2 w-full"
                renderCustomHeader={({ date, decreaseMonth, increaseMonth }) => (
                  <div className="flex items-center justify-between px-2 py-1">
                    <button type="button" onClick={decreaseMonth}>&lt;</button>
                    <span className="mx-2">{format(date, 'LLLL', { locale: th })} {date.getFullYear() + 543}</span>
                    <button type="button" onClick={increaseMonth}>&gt;</button>
                  </div>
                )}
              />
            )}
          />
          {errors.birthDate && <p className="text-red-500 text-sm">{errors.birthDate.message}</p>}
          {watch('birthDate') && (
            <p className="mt-1 text-gray-700">{watch('birthDate')}</p>
          )}
        </div>
        <div>
          <label htmlFor="allergies">แพ้ยา (คั่นด้วยคอมม่า)</label>
          <input
            id="allergies"
            {...register('allergies', {
              setValueAs: v =>
                typeof v === 'string' ? v.split(',').map(s => s.trim()).filter(Boolean) : [],
            })}
          />
          {errors.allergies && <p className="text-red-500 text-sm">{errors.allergies.message}</p>}
        </div>
        <div>
          <label htmlFor="chronicDiseases">โรคประจำตัว (คั่นด้วยคอมม่า)</label>
          <input
            id="chronicDiseases"
            {...register('chronicDiseases', {
              setValueAs: v =>
                typeof v === 'string' ? v.split(',').map(s => s.trim()).filter(Boolean) : [],
            })}
          />
          {errors.chronicDiseases && (
            <p className="text-red-500 text-sm">{errors.chronicDiseases.message}</p>
          )}
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

import React, { useState, useEffect } from 'react';





() {
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






 // resolver for patient profile schema


// Using PatientProfileSchema for validation
const patientSchema = PatientProfileSchema; // placeholder, remove manual schema
  prefix: z.string().nonempty("กรุณากรอกคำนำหน้า"),
  firstName: z.string().nonempty("กรุณากรอกชื่อ"),
  lastName: z.string().nonempty("กรุณากรอกนามสกุล"),
  phone: z.string().nonempty("กรุณากรอกเบอร์โทรศัพท์").regex(/^[0-9]{9,10}$/, "เบอร์โทรศัพท์ไม่ถูกต้อง"),
});
export type Patient = z.infer<typeof patientSchema>;

() {
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
