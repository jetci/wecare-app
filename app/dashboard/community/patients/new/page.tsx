'use client';

import React, { useState, useEffect, useMemo, forwardRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
// Lazy load map components on client only
const GoogleMap = dynamic(() => import('@react-google-maps/api').then(mod => mod.GoogleMap), { ssr: false });
const Marker = dynamic(() => import('@react-google-maps/api').then(mod => mod.Marker), { ssr: false });
const InfoWindow = dynamic(() => import('@react-google-maps/api').then(mod => mod.InfoWindow), { ssr: false });
import ThaiDatePicker from '@/components/ui/ThaiDatePicker';
import 'react-datepicker/dist/react-datepicker.css';
import { registerLocale } from 'react-datepicker';
import { th } from 'date-fns/locale/th';
import toast from 'react-hot-toast';
import imageCompression from 'browser-image-compression';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { validateImage, compressImage } from '../../../../../utils/image';
import { schema, FormValues } from './schema';
import { useNewPatientForm } from './useNewPatientForm';
import { useDirtyCheck } from './useDirtyCheck';
import { Spinner } from '@/components/ui/Spinner'
registerLocale('th', th);

// Custom input to display Thai BE year
const CustomInput = forwardRef<HTMLInputElement, { value?: string; onClick?: () => void }>((props, ref) => {
  const { value = '', onClick } = props;
  // transform CE yyyy to BE yyyy
  const display = value.split('/').map((part, idx) => idx === 2 ? String(Number(part) + 543) : part).join('/');
  return (
    <input
      ref={ref}
      onClick={onClick}
      value={display}
      readOnly
      placeholder="วัน/เดือน/ปี"
      className="w-full border border-gray-300 p-2 rounded-md bg-white"
    />
  );
});
CustomInput.displayName = 'CustomInput';

const prefixes = ['นาย', 'นาง', 'นางสาว', 'เด็กชาย', 'เด็กหญิง'];
const prefixGenderMap: Record<string,string> = { 'นาย':'ชาย', 'เด็กชาย':'ชาย', 'นาง':'หญิง', 'นางสาว':'หญิง', 'เด็กหญิง':'หญิง' };
const groups = ['ผู้ยากไร้', 'ผู้ป่วยติดเตียง', 'อื่นๆ'];
const villages = Array.from({ length: 20 }, (_, i) => `หมู่${i + 1}`);
const fixedLocation = { subdistrict: 'เวียง', district: 'ฝาง', province: 'เชียงใหม่' } as const;

// Thai month names
const thaiMonths = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];

// Village name mapping by หมู่ที่
const villageMap: Record<string,string> = {
  'หมู่1':'บ้านหนองตุ้ม', 'หมู่2':'บ้านป่าบง',
  'หมู่3':'บ้านเต๋าดิน, บ้านเวียงสุทโธ', 'หมู่4':'บ้านสวนดอก',
  'หมู่5':'บ้านต้นหนุน', 'หมู่6':'บ้านสันทรายคองน้อย',
  'หมู่7':'บ้านแม่ใจใต้', 'หมู่8':'บ้านแม่ใจเหนือ',
  'หมู่9':'บ้านริมฝาง, บ้านสันป่าไหน่','หมู่10':'บ้านห้วยเฮี่ยน, บ้านสันป่ายาง',
  'หมู่11':'บ้านท่าสะแล','หมู่12':'บ้านโป่งถืบ','หมู่13':'บ้านห้วยบอน',
  'หมู่14':'บ้านเสาหิน','หมู่15':'บ้านโป่งถืบใน','หมู่16':'บ้านปางผึ้ง',
  'หมู่17':'บ้านใหม่คองน้อย','หมู่18':'บ้านศรีดอนชัย','หมู่19':'บ้านใหม่ชยาราม','หมู่20':'บ้านสระนิคม'
};

export default function NewPatientPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAuthChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  useEffect(() => {
    // Safely check accessToken in cookies
    const cookieStr = typeof document.cookie === 'string' ? document.cookie : '';
    const auth = cookieStr.split('; ').some(c => typeof c === 'string' && c.startsWith('accessToken='));
    setAuthenticated(auth);
    setAuthChecked(true);
    if (!auth) router.push('/login');
  }, [router]);

  // Unconditionally call hooks before conditional returns
  const fixedLocation = { subdistrict: 'เวียง', district: 'ฝาง', province: 'เชียงใหม่' } as const;
  const { register, control, trigger, formState: { errors, isSubmitting, isDirty }, getValues, watch, setValue, reset, setError, clearErrors, handleSubmit } = useNewPatientForm();
  useDirtyCheck(isDirty);
  const docUrls = useMemo(() => ({
    docCertHead: searchParams?.get('docCertHead') ?? '',
    docCertBed: searchParams?.get('docCertBed') ?? '',
    docAppointment: searchParams?.get('docAppointment') ?? '',
    docOther: searchParams?.get('docOther') ?? ''
  }), [searchParams]);
  const defaultPreview = '/wiangfang.jpg';
  const [previewUrl, setPreviewUrl] = useState<string>(defaultPreview);
  const [marker, setMarker] = useState<{ lat: number; lng: number }>({
    lat: (() => { const n = Number(searchParams?.get('lat') ?? ''); return isNaN(n) ? 18.1169 : n; })(),
    lng: (() => { const n = Number(searchParams?.get('lng') ?? ''); return isNaN(n) ? 98.1350 : n; })()
  });
  const [locationLabel, setLocationLabel] = useState<string>('');
  const [compressedPhoto, setCompressedPhoto] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const isUploading = uploading;

  useEffect(() => {
    // initialize form values on mount and when defaultValues change
    reset();
  }, [reset]);

  useEffect(() => {
    if (!searchParams?.get('lat')) navigator.geolocation.getCurrentPosition(pos => {
      setMarker({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    });
  }, [searchParams]);

  useEffect(() => {
    // Guard errors.nationalId being undefined
    const nationalError = errors?.nationalId;
    if (nationalError) {
      const idMsg = nationalError.message;
      if (idMsg === 'บัตรประชาชน 13 หลัก') {
        // do something
      }
    }
  }, [errors]);

  useEffect(() => {
    const selectedPrefix = watch('prefix');
    if (selectedPrefix) {
      const g = prefixGenderMap[selectedPrefix] ?? '';
      setValue('gender', g);
      // clear errors and re-validate prefix and gender
      clearErrors(['prefix', 'gender']);
      trigger(['prefix', 'gender']);
    }
  }, [watch('prefix')]);

  // Recalculate age when date of birth changes
  const dobValue = watch('dob');
  useEffect(() => {
    if (dobValue instanceof Date) {
      const today = new Date();
      let computedAge = today.getFullYear() - dobValue.getFullYear();
      const m = today.getMonth() - dobValue.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dobValue.getDate())) computedAge--;
      setValue('age', computedAge);
    }
  }, [dobValue, setValue]);

  useEffect(() => {
    const copy = watch('copyAddr');
    if (copy) {
      setValue('currNo', watch('addrNo') || '');
      setValue('currMoo', watch('addrMoo') || '');
      setValue('currSub', fixedLocation.subdistrict);
      setValue('currDist', fixedLocation.district);
      setValue('currProv', fixedLocation.province);
    }
  }, [watch('copyAddr'), watch('addrNo'), watch('addrMoo'), setValue]);

  useEffect(() => {
    const groupValue = watch('patientGroup');
    if (groupValue === 'ผู้ป่วยติดเตียง') {
      setValue('statusCannotHelpSelf', true);
      setValue('statusHelpSelf', false);
    }
  }, [watch('patientGroup'), setValue]);

  // Authentication guard moved here
  if (!isAuthChecked) return null;
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">กรุณาเข้าสู่ระบบก่อนใช้งานหน้านี้</p>
      </div>
    );
  }

  // Preview before saving
  const handlePreview = async (e?: React.FormEvent) => {
    e?.preventDefault();
    // Validate form before preview
    const valid = await trigger();
    if (!valid) {
      setUploading(false);
      return;
    }
    const current = getValues() as any;
    // Required fields check
    if (!current.firstName || !current.lastName || !current.nationalId || !current.phone) {
      setUploading(false);
      return;
    }
    console.log('handlePreview called');
    setUploading(true);
    let photoUrl = '';
    const photoList = current.photo as FileList;
    if (photoList && photoList.length) {
      const file = compressedPhoto || photoList[0];
      const fd = new FormData(); fd.append('file', file);
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        if (res.ok) {
          const data = await res.json(); photoUrl = data.url || '';
        } else console.error('Preview upload failed', res.status);
      } catch (err) {
        console.error('Preview upload error', err);
      }
    }
    const params = new URLSearchParams();
    Object.entries(current).forEach(([k, v]) =>
      params.set(k, v instanceof Date ? v.toISOString() : String(v ?? ''))
    );
    params.set('lat', String(marker.lat));
    params.set('lng', String(marker.lng));
    params.set('locationLabel', locationLabel || '');
    params.set('villageName', villageMap[current.addrMoo] || '');
    params.set('currVillageName', villageMap[current.currMoo] || '');
    const groupVal = current.patientGroup || current.group || current.otherGroup || '';
    params.set('patientGroup', groupVal);
    // Include photo URL
    params.set('photo', photoUrl);
    setUploading(false);
    const reviewPath = `/dashboard/community/patients/review?${params.toString()}`;
    console.log('Redirecting to:', reviewPath);
    window.location.href = reviewPath;
  };

  // Full submit: POST to /api/patients with FormData
  const handleSubmitForm = async () => {
    setSubmitError(null);
    const valid = await trigger();
    if (!valid) return;
    setUploading(true);
    const values = getValues() as any;
    // if copied address, ensure villageName
    if (values.copyAddr) values.villageName = values.currVillageName;
    const form = new FormData();
    // patient fields
    Object.entries(values).forEach(([k, v]) => {
      if (['photo','docCertHead','docCertBed','docAppointment','docOther'].includes(k)) return;
      form.append(k, v?.toString() || '');
    });
    // coordinates
    form.append('latitude', String(marker.lat));
    form.append('longitude', String(marker.lng));
    form.append('locationLabel', locationLabel || '');
    // files
    const files = ['photo','docCertHead','docCertBed','docAppointment','docOther'] as const;
    for (const key of files) {
      const fls = (values as any)[key] as FileList;
      if (fls && fls.length) {
        const file = key === 'photo' && compressedPhoto ? compressedPhoto : fls[0];
        form.append(key, file);
      }
    }
    try {
      const res = await fetch('/api/patients', { method: 'POST', body: form });
      if (res.ok) {
        toast.success('สร้างผู้ป่วยเรียบร้อย');
        router.push('/dashboard/community/patients');
      } else {
        const errMsg = await res.text().catch(()=>'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        setSubmitError(errMsg || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } catch (err) {
      setSubmitError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์');
    }
    setUploading(false);
  };

  const handleMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    setMarker(pos);
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: pos, language: 'th' }, (results, status) => {
      if (status === 'OK' && results && results[0]) setLocationLabel(results[0].formatted_address);
      else console.error('Geocode failed:', status);
    });
  };

  const breadcrumbs = [
    { label: 'แดชบอร์ด', href: '/dashboard/community' },
    { label: 'ผู้ป่วย', href: '/dashboard/community/patients' },
    { label: 'ลงทะเบียนใหม่', href: '' }
  ];

  return (
    <div className="space-y-6">
      {/* แสดง error กรณี submit ล้มเหลว */}
      {submitError && <p className="text-red-600 mb-4">{submitError}</p>}
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500" aria-label="Breadcrumb">
        <ol className="list-reset flex space-x-2">
          {breadcrumbs.map((bc, idx) => (
            <li key={idx} className="flex items-center">
              {bc.href ? (
                <Link href={bc.href} className="hover:underline">
                  {bc.label}
                </Link>
              ) : (
                <span className="text-gray-700">{bc.label}</span>
              )}
              {idx < breadcrumbs.length - 1 && <span className="mx-2">/</span>}
            </li>
          ))}
        </ol>
      </nav>
      {/* Page Title */}
      <h1 className="text-2xl font-bold">ลงทะเบียนผู้ป่วยใหม่</h1>
      <form key="newPatientForm" onSubmit={handlePreview}>
        {/* Loading indicator */}
        {isUploading && <p className="text-blue-600">กำลังอัปโหลดไฟล์...</p>}
        {/* Personal Info */}
        <fieldset className="bg-white border border-gray-300 p-6 rounded-lg shadow-lg">
          <legend className="font-semibold">ข้อมูลตามบัตรประชาชน</legend>
          {/* Prefix & Photo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="flex flex-col w-28 space-y-2">
              <label htmlFor="prefix" className="text-sm font-bold text-gray-700 mb-1">คำนำหน้า</label>
              <select id="prefix" {...register('prefix')} aria-invalid={!!errors.prefix} aria-describedby="error-prefix" className="w-full border border-gray-300 p-2 rounded-md bg-white">
                <option value="" disabled>เลือก</option>
                {prefixes.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              {errors.prefix && <p id="error-prefix" className="text-red-600">{errors.prefix.message}</p>}
              <label htmlFor="gender" className="text-sm font-bold text-gray-700 mt-2 mb-1">เพศ</label>
              <input type="text" id="gender" {...register('gender')} value={watch('prefix') ? prefixGenderMap[watch('prefix')] : ''} readOnly className="w-full border border-gray-300 p-2 rounded-md bg-gray-100" />
            </div>
            <div className="flex flex-col w-28">
              <label htmlFor="bloodGroup" className="text-sm font-bold text-gray-700 mb-1">กรุ๊ปเลือด</label>
              <select id="bloodGroup" {...register('bloodGroup')} aria-invalid={!!errors.bloodGroup} aria-describedby="error-bloodGroup" className="w-full border border-gray-300 p-2 rounded-md bg-white">
                <option value="" disabled>เลือก</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="AB">AB</option>
                <option value="O">O</option>
              </select>
              {errors.bloodGroup && <p id="error-bloodGroup" className="text-red-600">{errors.bloodGroup.message}</p>}
            </div>
            <div className="flex flex-col">
              <label htmlFor="photo" className="text-sm font-bold text-gray-700 mb-1">รูปถ่ายผู้ป่วย</label>
              <label htmlFor="photo-upload" className="text-sm font-bold text-blue-600 hover:underline cursor-pointer mb-1">เพิ่ม หนังสือรับรองผู้ป่วยติดเตียง</label>
              <Controller control={control} name="photo" render={({ field }) => (
                <>
                  <input id="photo-upload" type="file" accept="image/*" className="hidden"
                    onChange={async e => {
                      const files = e.target.files;
                      field.onChange(files);
                      if (files && files.length > 0) {
                        const file = files[0];
                        const valid = validateImage(file);
                        if (!valid) { setError('photo', { type: 'manual', message: 'ไฟล์ไม่ถูกต้อง' }); setPreviewUrl(defaultPreview); return; }
                        clearErrors('photo'); trigger('photo'); try { const comp = await compressImage(file); setCompressedPhoto(comp);} catch { setCompressedPhoto(file);}  
                        setPreviewUrl(URL.createObjectURL(file));
                      }
                    }} />
                  {field.value?.[0]?.name && <span className="text-sm text-gray-600">{field.value[0].name}</span>}
                  {previewUrl && <img src={previewUrl} alt="preview" className="w-32 h-32 object-cover mt-2" />}
                </>
              )} />
              {errors.photo && <p className="text-red-600 mt-1">{errors.photo.message}</p>}
            </div>
          </div>
          {/* Name & Surname */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col">
              <label htmlFor="firstName" className="text-sm font-bold text-gray-700 mb-1">ชื่อ</label>
              <input id="firstName" {...register('firstName')} aria-invalid={!!errors.firstName} aria-describedby="error-firstName" className="w-full border border-gray-300 p-2 rounded-md bg-white" />
              {errors.firstName && <p id="error-firstName" className="text-red-600">{errors.firstName.message}</p>}
            </div>
            <div className="flex flex-col">
              <label htmlFor="lastName" className="text-sm font-bold text-gray-700 mb-1">สกุล</label>
              <input id="lastName" {...register('lastName')} aria-invalid={!!errors.lastName} aria-describedby="error-lastName" className="w-full border border-gray-300 p-2 rounded-md bg-white" />
              {errors.lastName && <p id="error-lastName" className="text-red-600">{errors.lastName.message}</p>}
            </div>
          </div>
          {/* ID & Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label htmlFor="nationalId" className="text-sm font-bold text-gray-700 mb-1">หมายเลขบัตรประชาชน</label>
              <input id="nationalId" maxLength={13} {...register('nationalId')} aria-invalid={!!errors.nationalId} aria-describedby="error-nationalId" className="w-full border border-gray-300 p-2 rounded-md bg-white" />
              {errors.nationalId && <p id="error-nationalId" className="text-red-600">{errors.nationalId.message}</p>}
            </div>
            <div className="flex flex-col">
              <label htmlFor="phone" className="text-sm font-bold text-gray-700 mb-1">เบอร์โทรศัพท์</label>
              <input id="phone" type="tel" {...register('phone')} aria-invalid={!!errors.phone} aria-describedby="error-phone" className="w-full border border-gray-300 p-2 rounded-md bg-white" />
              {errors.phone && <p id="error-phone" className="text-red-600">{errors.phone.message}</p>}
            </div>
          </div>
          {/* Date of Birth & Age */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex flex-col">
              <label htmlFor="dob" className="text-sm font-bold text-gray-700 mb-1">วันเดือนปีเกิด</label>
              <Controller control={control} name="dob" render={({ field }) => (
                <ThaiDatePicker
                  {...field}
                  selected={field.value}
                   value={field.value ? field.value.toISOString().split('T')[0] : ''}
                  onChange={field.onChange}
                  customInput={<CustomInput />}
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />
              )} />
              {errors.dob && <p className="text-red-600">{errors.dob.message}</p>}
            </div>
            <div className="flex flex-col">
              <label htmlFor="age" className="text-sm font-bold text-gray-700 mb-1">อายุ</label>
              <input type="text" id="age" value={watch('age')} readOnly className="w-full border border-gray-300 p-2 rounded-md bg-gray-100" />
            </div>
          </div>
        </fieldset>

        {/* Addresses */}
        <fieldset className="bg-white border border-gray-300 p-6 rounded-lg shadow-lg">
          <legend className="font-semibold">ที่อยู่ตามบัตรประชาชน</legend>
          {/* Address Row: No, Moo, Village Name */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col w-28">
              <label htmlFor="addrNo" className="text-sm font-bold text-gray-700 mb-1">บ้านเลขที่</label>
              <input id="addrNo" {...register('addrNo')} className="w-full border border-gray-300 p-2 rounded-md bg-white" />
            </div>
            <div className="flex flex-col w-24">
              <label htmlFor="addrMoo" className="text-sm font-bold text-gray-700 mb-1">หมู่ที่</label>
              <select id="addrMoo" {...register('addrMoo')} className="w-full border border-gray-300 p-2 rounded-md bg-white">
                {villages.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="flex flex-col">
              <label htmlFor="addrVillage" className="text-sm font-bold text-gray-700 mb-1">ชื่อหมู่บ้าน</label>
              <input id="addrVillage" value={villageMap[watch('addrMoo')] || ''} readOnly className="w-full border border-gray-300 p-2 rounded-md bg-gray-100" />
            </div>
          </div>
          {/* Address Row: Subdistrict, District, Province */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="flex flex-col">
              <label htmlFor="addrSub" className="text-sm font-bold text-gray-700 mb-1">ตำบล</label>
              <input id="addrSub" value={fixedLocation.subdistrict} readOnly className="w-full border border-gray-300 p-2 rounded-md bg-gray-100" />
            </div>
            <div className="flex flex-col">
              <label htmlFor="addrDist" className="text-sm font-bold text-gray-700 mb-1">อำเภอ</label>
              <input id="addrDist" value={fixedLocation.district} readOnly className="w-full border border-gray-300 p-2 rounded-md bg-gray-100" />
            </div>
            <div className="flex flex-col">
              <label htmlFor="addrProv" className="text-sm font-bold text-gray-700 mb-1">จังหวัด</label>
              <input id="addrProv" value={fixedLocation.province} readOnly className="w-full border border-gray-300 p-2 rounded-md bg-gray-100" />
            </div>
          </div>
        </fieldset>

        <fieldset className="bg-white border border-gray-300 p-6 rounded-lg shadow-lg">
          <legend className="font-semibold">ที่อยู่ปัจจุบัน</legend>
          <label className="flex items-center mb-4">
            <input
              type="checkbox"
              {...register('copyAddr')}
              className="mr-2"
            />
            ใช้ที่อยู่ตามบัตรประชาชน
          </label>
          {!watch('copyAddr') && (
            <>
              {/* Current Address: No, Moo, Village */}
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col w-28">
                  <label htmlFor="currNo" className="text-sm font-bold text-gray-700 mb-1">บ้านเลขที่</label>
                  <input id="currNo" {...register('currNo')} className="w-full border border-gray-300 p-2 rounded-md bg-white" />
                </div>
                <div className="flex flex-col w-24">
                  <label htmlFor="currMoo" className="text-sm font-bold text-gray-700 mb-1">หมู่ที่</label>
                  <select id="currMoo" {...register('currMoo')} className="w-full border border-gray-300 p-2 rounded-md bg-white">
                    {villages.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label htmlFor="currVillage" className="text-sm font-bold text-gray-700 mb-1">ชื่อหมู่บ้าน</label>
                  <input id="currVillage" value={villageMap[watch('currMoo')] || ''} readOnly className="w-full border border-gray-300 p-2 rounded-md bg-gray-100" />
                </div>
              </div>
              {/* Current Address: Subdistrict, District, Province */}
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="flex flex-col">
                  <label htmlFor="currSub" className="text-sm font-bold text-gray-700 mb-1">ตำบล</label>
                  <input id="currSub" {...register('currSub')} className="w-full border border-gray-300 p-2 rounded-md bg-white" />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="currDist" className="text-sm font-bold text-gray-700 mb-1">อำเภอ</label>
                  <input id="currDist" {...register('currDist')} className="w-full border border-gray-300 p-2 rounded-md bg-white" />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="currProv" className="text-sm font-bold text-gray-700 mb-1">จังหวัด</label>
                  <input id="currProv" {...register('currProv')} className="w-full border border-gray-300 p-2 rounded-md bg-white" />
                </div>
              </div>
            </>
          )}
        </fieldset>

        {/* Patient Group */}
        <fieldset className="bg-white border border-gray-300 p-6 rounded-lg shadow-lg">
          <legend className="font-semibold">กลุ่มผู้ป่วย</legend>
          <div className="flex flex-col w-full">
            <label htmlFor="patientGroup" className="text-sm font-bold text-gray-700 mb-1">กลุ่มผู้ป่วย</label>
            <select id="patientGroup" {...register('patientGroup')} className="w-full border border-gray-300 p-2 rounded-md bg-white">
              <option value="" disabled>เลือก</option>
              {groups.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          {watch('patientGroup') === 'อื่นๆ' && (
            <div className="flex flex-col mt-2">
              <label htmlFor="otherGroup" className="text-sm font-bold text-gray-700 mb-1">ระบุ</label>
              <input id="otherGroup" {...register('otherGroup')} placeholder="ระบุ" className="w-full border border-gray-300 p-2 rounded-md bg-white" />
            </div>
          )}
          {/* Functional Status */}
          <div className="mt-4 space-y-2">
            <label className="flex items-center">
              <input type="checkbox" {...register('statusHelpSelf')} className="mr-2" /> ช่วยเหลือตัวเองได้
            </label>
            <label className="flex items-center">
              <input type="checkbox" {...register('statusCannotHelpSelf')} className="mr-2" /> ช่วยเหลือตัวเองไม่ได้
            </label>
            <label className="flex items-center">
              <input type="checkbox" {...register('needTool')} className="mr-2" /> ต้องการเครื่องมือพิเศษ
            </label>
            {watch('needTool') && (
              <input type="text" {...register('toolRemark')} placeholder="กรุณาระบุเครื่องมือพิเศษ" className="w-full border border-gray-300 p-2 rounded-md bg-white" />
            )}
          </div>
        </fieldset>

        {/* Map Location */}
        <fieldset className="bg-white border border-gray-300 p-6 rounded-lg shadow-lg">
          <legend className="font-semibold">ตำแหน่งรับส่ง (ลากเพื่อปรับ)</legend>
          <GoogleMap mapContainerStyle={{ width: '100%', height: '300px' }} center={marker} zoom={15} mapTypeId="satellite">
            <Marker position={marker} draggable onDragEnd={handleMarkerDragEnd} />
            {locationLabel && (
              <InfoWindow position={marker} onCloseClick={() => setLocationLabel('')}>
                <div className="text-sm font-medium text-gray-800">{locationLabel}</div>
              </InfoWindow>
            )}
          </GoogleMap>
          {/* Preview coordinates */}
          {marker && (
            <p className="mt-2 text-sm text-gray-700">
              พิกัดที่เลือก: {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
            </p>
          )}
          {locationLabel && <p className="mt-1 text-sm text-gray-500"> {locationLabel}</p>}
          <div className="flex flex-col mt-2">
            <label htmlFor="remark" className="text-sm font-bold text-gray-700 mb-1">หมายเหตุ</label>
            <input id="remark" {...register('remark')} className="w-full border border-gray-300 p-2 rounded-md bg-white" />
          </div>
          <input type="hidden" {...register('latitude')} value={String(marker.lat)} />
          <input type="hidden" {...register('longitude')} value={String(marker.lng)} />
          <input type="hidden" {...register('locationLabel')} value={locationLabel} />
        </fieldset>

        {/* Patient Documents */}
        <fieldset className="bg-white border border-gray-300 p-6 rounded-lg shadow-lg">
          <legend className="font-semibold">เอกสารผู้ป่วย</legend>
          <div className="space-y-4">
            <div className="flex flex-col">
              <label htmlFor="docCertHead" className="text-sm font-bold text-blue-600 hover:underline cursor-pointer mb-1">คลิกที่นี่ เพื่อเพิ่ม หนังสือรับรอง กำนัน/ผู้ใหญ่บ้าน</label>
              <input id="docCertHead" type="file" accept="application/pdf,image/*" {...register('docCertHead')} className="hidden" />
              {(watch('docCertHead') || []).length > 0 ? (
                <span className="text-sm text-green-600">ได้รับเอกสาร: {(watch('docCertHead') || [])[0]?.name || ''}</span>
              ) : docUrls.docCertHead ? (
                <button type="button" onClick={() => window.open(docUrls.docCertHead, '_blank')} className="text-sm text-blue-600 underline">ดูเอกสาร</button>
              ) : (
                <span className="text-sm text-red-600">ยังไม่ได้รับเอกสาร</span>
              )}
            </div>
            <div className="flex flex-col">
              <label htmlFor="docCertBed" className="text-sm font-bold text-blue-600 hover:underline cursor-pointer mb-1">คลิกที่นี่ เพื่อเพิ่ม หนังสือรับรองผู้ป่วยติดเตียง</label>
              <input id="docCertBed" type="file" accept="application/pdf,image/*" {...register('docCertBed')} className="hidden" />
              {(watch('docCertBed') || []).length > 0 ? (
                <span className="text-sm text-green-600">ได้รับเอกสาร: {(watch('docCertBed') || [])[0]?.name || ''}</span>
              ) : docUrls.docCertBed ? (
                <button type="button" onClick={() => window.open(docUrls.docCertBed, '_blank')} className="text-sm text-blue-600 underline">ดูเอกสาร</button>
              ) : (
                <span className="text-sm text-red-600">ยังไม่ได้รับเอกสาร</span>
              )}
            </div>
            <div className="flex flex-col">
              <label htmlFor="docAppointment" className="text-sm font-bold text-blue-600 hover:underline cursor-pointer mb-1">คลิกที่นี่ เพื่อเพิ่ม สำเนาใบนัดแพทย์</label>
              <input id="docAppointment" type="file" accept="application/pdf" {...register('docAppointment')} className="hidden" />
              {(watch('docAppointment') || []).length > 0 ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-green-600">ได้รับเอกสาร: {(watch('docAppointment') || [])[0]?.name || ''}</span>
                  <button type="button" onClick={() => {
                    const files = watch('docAppointment') || [];
                    if (files[0]) {
                      const url = URL.createObjectURL(files[0]);
                      window.open(url, '_blank');
                    }
                  }} className="text-sm text-blue-600 underline">ดูเอกสาร</button>
                </div>
              ) : docUrls.docAppointment ? (
                <button type="button" onClick={() => window.open(docUrls.docAppointment, '_blank')} className="text-sm text-blue-600 underline">ดูเอกสาร</button>
              ) : (
                <span className="text-sm text-red-600">ยังไม่ได้รับเอกสาร</span>
              )}
            </div>
            <div className="flex flex-col">
              <label htmlFor="docOther" className="text-sm font-bold text-blue-600 hover:underline cursor-pointer mb-1">คลิกที่นี่ เพื่อเพิ่ม เอกสารอื่นๆ</label>
              <input id="docOther" type="file" accept="application/pdf,image/*" {...register('docOther')} className="hidden" />
              {(watch('docOther') || []).length > 0 ? (
                <span className="text-sm text-green-600">ได้รับเอกสาร: {(watch('docOther') || [])[0]?.name || ''}</span>
              ) : docUrls.docOther ? (
                <button type="button" onClick={() => window.open(docUrls.docOther, '_blank')} className="text-sm text-blue-600 underline">ดูเอกสาร</button>
              ) : (
                <span className="text-sm text-red-600">ยังไม่ได้รับเอกสาร</span>
              )}
            </div>
          </div>
        </fieldset>

        {/* Preview/Check Button */}
        <div className="mt-4">
          <button
            type="submit"
            disabled={!isDirty || isSubmitting || isUploading}
            className="bg-blue-600 text-white px-4 py-2 rounded flex items-center justify-center"
          >
            {(isSubmitting || isUploading)
              ? <Spinner />
              : 'ตรวจสอบข้อมูล'
            }
          </button>
          <button
            type="button"
            onClick={() => reset()}
            className="ml-2 bg-gray-600 text-white px-4 py-2 rounded"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
