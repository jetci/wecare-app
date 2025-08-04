"use client";

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { NewRequestSchema, NewRequestForm } from '@/schemas/newRequest.schema';
import DatePicker, { registerLocale } from 'react-datepicker';
import * as localeTh from 'date-fns/locale/th';

// Derive actual locale object (handle default export compatibility)
const thLocale = ('default' in localeTh ? (localeTh as any).default : localeTh);


import { format } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';

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

export default function NewRequestPage() {
  const { register, handleSubmit, control, watch, setValue, formState: { errors, isSubmitting } } = useForm<NewRequestForm>({
    resolver: zodResolver(NewRequestSchema),
  });

  const [patient, setPatient] = useState<{
    fullName: string;
    address: string;
    phone: string;
    patientGroup: string;
    pickupLocation: { lat: number; lng: number };
  } | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  // Format a Date to Thai Buddhist year display
  const formatBuddhist = (date: Date) =>
    format(date, 'dd MMMM yyyy', { locale: thLocale }).replace(/\d{4}$/, y => String(Number(y) + 543));

  const handleSearch = async () => {
    const nid = watch('nationalId');
    setSearching(true);
    setSearchError(null);
    try {
      const res = await fetch(`/api/patients?nationalId=${nid}`);
      const data = await res.json();
      if (!res.ok || !data.patient) {
        throw new Error(data.error || 'ไม่พบผู้ป่วย');
      }
      const p = data.patient;
      setPatient({
        fullName: `${p.prefix} ${p.firstName} ${p.lastName}`,
        address: p.currentAddress,
        phone: p.currentAddress_phone || p.idCardAddress_phone,
        patientGroup: p.patientGroup,
        pickupLocation: { lat: p.pickupLocation_lat, lng: p.pickupLocation_lng },
      });
      setValue('nationalId', nid);
    } catch (e: any) {
      setSearchError(e.message);
      setPatient(null);
    } finally {
      setSearching(false);
    }
  };

  const onSubmit = async (data: NewRequestForm) => {
    try {
      const res = await fetch('/api/community/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, patient }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'สร้างคำขอไม่สำเร็จ');
      }
      alert('สร้างคำขอสำเร็จ');
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label>เลขบัตรประชาชน</label>
        <div className="flex gap-2">
          <input
            type="text"
            {...register('nationalId')}
            className="border p-2 flex-1"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={searching}
            className="px-4 bg-blue-600 text-white"
          >
            {searching ? 'ค้นหา...' : 'ค้นหา'}
          </button>
        </div>
        {errors.nationalId && <p className="text-red-500">{errors.nationalId.message}</p>}
        {searchError && <p className="text-red-500">{searchError}</p>}
      </div>

      {patient && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label>ชื่อ-สกุล</label>
            <input value={patient.fullName} readOnly className="border p-2 w-full bg-gray-100" />
          </div>
          <div>
            <label>ที่อยู่</label>
            <input value={patient.address} readOnly className="border p-2 w-full bg-gray-100" />
          </div>
          <div>
            <label>เบอร์โทร</label>
            <input value={patient.phone} readOnly className="border p-2 w-full bg-gray-100" />
          </div>
          <div>
            <label>กลุ่มผู้ป่วย</label>
            <input value={patient.patientGroup} readOnly className="border p-2 w-full bg-gray-100" />
          </div>
          <div>
            <label>พิกัดรับผู้ป่วย (Lat/Lng)</label>
            <input
              value={`${patient.pickupLocation.lat}, ${patient.pickupLocation.lng}`}
              readOnly
              className="border p-2 w-full bg-gray-100"
            />
          </div>
        </div>
      )}

      <div>
        <label>วันที่ต้องการใช้บริการ</label>
        <Controller
          control={control}
          name="serviceDate"
          render={({ field }) => (
            <DatePicker
              {...field}
              locale="th"
              dateFormat="dd-MM-yyyy"
              selected={field.value ? parseBuddhistDate(field.value) : null}
              onChange={(date: Date | null) => field.onChange(date ? toBuddhistDateString(date) : '')}
              minDate={new Date()}
              className="border p-2 w-full"
              renderCustomHeader={({ date, decreaseMonth, increaseMonth }) => (
                <div className="flex items-center justify-between px-2 py-1">
                  <button type="button" onClick={decreaseMonth}>&lt;</button>
                  <span className="mx-2">
                    {format(date, 'LLLL', { locale: thLocale })} {date.getFullYear() + 543}
                  </span>
                  <button type="button" onClick={increaseMonth}>&gt;</button>
                </div>
              )}
            />
          )}
        />
        {watch('serviceDate') && (
          <p className="mt-1 text-gray-700">{watch('serviceDate')}
            {formatBuddhist(new Date(watch('serviceDate')!))}
          </p>
        )}
        {errors.serviceDate && <p className="text-red-500">{errors.serviceDate.message}</p>}
      </div>

      <div>
        <label>ประเภทคำขอ</label>
        <select {...register('requestType')} className="border p-2 w-full">
          <option value="">-- เลือกประเภท --</option>
          <option value="รับส่งผู้ป่วย">รับส่งผู้ป่วย</option>
          <option value="ปรึกษาแพทย์">ปรึกษาแพทย์</option>
          <option value="เยี่ยมบ้าน">เยี่ยมบ้าน</option>
          <option value="อื่น ๆ">อื่น ๆ</option>
        </select>
        {errors.requestType && <p className="text-red-500">{errors.requestType.message}</p>}
      </div>

      <div>
        <label>รายละเอียดเพิ่มเติม</label>
        <textarea
          {...register('details')}
          className="border p-2 w-full"
          rows={4}
        />
        {errors.details && <p className="text-red-500">{errors.details.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !patient}
        className="px-6 py-2 bg-green-600 text-white rounded disabled:opacity-50"
      >
        ส่งคำขอ
      </button>
    </form>
  );
}
