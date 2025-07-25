"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { NewRequestSchema, NewRequestForm } from '@/schemas/newRequest.schema';

export default function NewRequestPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<NewRequestForm>({
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

  const watchDate = watch('serviceDate');
  const displayDate = watchDate
    ? (() => {
        const d = new Date(watchDate);
        const day = d.getDate();
        const month = d.getMonth() + 1;
        const year = d.getFullYear() + 543;
        return `${day}/${month}/${year}`;
      })()
    : '';

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
      // set read-only values
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
      // success
      alert('สร้างคำขอสำเร็จ');
    } catch (e: any) {
      alert(e.message);
    }
  };

  const today = new Date().toISOString().split('T')[0];

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
        <input
          type="date"
          {...register('serviceDate')}
          min={today}
          className="border p-2 w-full"
        />
        {displayDate && <p className="text-sm">วันที่เลือก: {displayDate}</p>}
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
