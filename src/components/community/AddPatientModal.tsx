'use client';

import React, { Fragment, useState, useEffect, useCallback } from 'react';
import { isValidThaiID } from '@/schemas/community/patient.schema';
import { Dialog, Transition } from '@headlessui/react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { patientFormSchema, type PatientFormData } from '@/schemas/community/patient.schema';
import { useAuth } from '@/context/AuthContext';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import DatePicker, { registerLocale } from 'react-datepicker';
import { th } from 'date-fns/locale/th';
import { getYear, getMonth, differenceInYears } from 'date-fns';
import "react-datepicker/dist/react-datepicker.css";
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

registerLocale('th', th);

const inputClass = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed";

const CustomHeader = ({
  date,
  changeYear,
  changeMonth,
  decreaseMonth,
  increaseMonth,
  prevMonthButtonDisabled,
  nextMonthButtonDisabled,
}: {
  date: Date;
  changeYear: (year: number) => void;
  changeMonth: (month: number) => void;
  decreaseMonth: () => void;
  increaseMonth: () => void;
  prevMonthButtonDisabled: boolean;
  nextMonthButtonDisabled: boolean;
}) => {
  const years = Array.from({ length: 100 }, (_, i) => getYear(new Date()) + 543 - i);
  const months = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];
  const currentBuddhistYear = getYear(date) + 543;
  return (
    <div className="m-2 flex justify-center items-center bg-gray-50 p-2 rounded-t-lg">
      <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled} className="p-1 rounded-full hover:bg-gray-200 disabled:opacity-50">
        <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
      </button>
      <select
        value={months[getMonth(date)]}
        onChange={({ target: { value } }) => changeMonth(months.indexOf(value))}
        className="mx-2 rounded-md border-gray-300 text-sm font-semibold shadow-sm"
      >
        {months.map((option) => (<option key={option} value={option}>{option}</option>))}
      </select>
      <select
        value={currentBuddhistYear}
        onChange={({ target: { value } }) => changeYear(parseInt(value) - 543)}
        className="rounded-md border-gray-300 text-sm font-semibold shadow-sm"
      >
        {years.map((option) => (<option key={option} value={option}>{option}</option>))}
      </select>
      <button onClick={increaseMonth} disabled={nextMonthButtonDisabled} className="p-1 rounded-full hover:bg-gray-200 disabled:opacity-50">
        <ChevronRightIcon className="h-5 w-5 text-gray-600" />
      </button>
    </div>
  );
};

const MapPicker = ({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) => {
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);
  const { isLoaded } = useJsApiLoader({ id: 'google-map-script', googleMapsApiKey: "AIzaSyA6zSQzVMAwN38_GKW2jQtdmT5Yvs9zHLc", libraries: ["places"] });
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
        setCurrentPosition(pos);
        onLocationChange(pos.lat, pos.lng);
      },
      () => {
        const defaultPos = { lat: 19.921, lng: 99.213 };
        setCurrentPosition(defaultPos);
        onLocationChange(defaultPos.lat, defaultPos.lng);
      }
    );
  }, [onLocationChange]);
  const onMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setCurrentPosition(newPos);
      onLocationChange(newPos.lat, newPos.lng);
    }
  };
  if (!isLoaded) return <div>กำลังโหลดแผนที่...</div>;
  return (
    <GoogleMap mapContainerStyle={{ width: '100%', height: '300px', borderRadius: '8px' }} center={currentPosition || undefined} zoom={15} mapTypeId="satellite">
      {currentPosition && <Marker position={currentPosition} draggable={true} onDragEnd={onMarkerDragEnd} />}
    </GoogleMap>
  );
};

export const AddPatientModal = ({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void; }) => {
  const { token } = useAuth();
  const [isSuccess, setIsSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormData>({ resolver: zodResolver(patientFormSchema), mode: 'onBlur' });

  const watchPrefix = watch('prefix');
  const watchPatientGroup = watch('patientGroup');
  const watchUseIdCardAddress = watch('useIdCardAddress');
  const watchIdCardAddress = watch(['idCardAddress_houseNumber', 'idCardAddress_moo', 'idCardAddress_phone']);
  const watchBirthDate = watch('birthDate');
  const watchNationalId = watch('nationalId');
  const calculatedAge = watchBirthDate ? differenceInYears(new Date(), watchBirthDate) : null;

  useEffect(() => {
    if (['นาย', 'เด็กชาย'].includes(watchPrefix)) setValue('gender', 'ชาย');
    else if (['นาง', 'นางสาว', 'เด็กหญิง'].includes(watchPrefix)) setValue('gender', 'หญิง');
  }, [watchPrefix, setValue]);
  
  useEffect(() => {
    if (watchUseIdCardAddress) {
      setValue('currentAddress_houseNumber', watchIdCardAddress[0]);
      setValue('currentAddress_moo', watchIdCardAddress[1]);
      setValue('currentAddress_phone', watchIdCardAddress[2]);
    }
  }, [watchUseIdCardAddress, watchIdCardAddress, setValue]);
  
  useEffect(() => { if (!isOpen) { reset(); setApiError(null); setIsSuccess(false);} }, [isOpen, reset]);
  
  const onSubmit: SubmitHandler<PatientFormData> = async (data) => {
    setApiError(null);
    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        setIsSuccess(true);
        setTimeout(() => { onSuccess(); onClose(); }, 1000);
        return;
      }
      const errorResult = await response.json();
      throw new Error(errorResult.error || 'ไม่สามารถเพิ่มข้อมูลผู้ป่วยได้');
    } catch (error: any) {
      setApiError(error.message);
    }
  };

  const handleLocationChange = useCallback((lat: number, lng: number) => { setValue('pickupLocation_lat', lat, { shouldValidate: true }); setValue('pickupLocation_lng', lng, { shouldValidate: true }); }, [setValue]);

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="relative w-full max-w-3xl transform rounded-lg bg-white p-6 text-left shadow-xl transition-all">
              <form onSubmit={handleSubmit(onSubmit)}>
                <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">เพิ่มผู้ป่วยในความดูแล</Dialog.Title>
                
                <div className="mt-4 grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6">
                  {/* Personal Info */}
                  <div className="sm:col-span-2"><label>คำนำหน้า</label><select {...register('prefix')} className={inputClass}><option value="">--เลือก--</option><option>นาย</option><option>นาง</option><option>นางสาว</option><option>เด็กชาย</option><option>เด็กหญิง</option></select>{errors.prefix && <p className="text-red-500 text-xs mt-1">{errors.prefix.message}</p>}</div>
                  <div className="sm:col-span-2"><label>ชื่อจริง</label><input {...register('firstName')} className={inputClass} />{errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}</div>
                  <div className="sm:col-span-2"><label>นามสกุล</label><input {...register('lastName')} className={inputClass} />{errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}</div>
                  <div className="sm:col-span-3"><label>เลขบัตรประชาชน</label><input {...register('nationalId')} className={inputClass} />{errors.nationalId && <p className="text-red-500 text-xs mt-1">{errors.nationalId.message}</p>}</div>
                  <div className="sm:col-span-1"><label>เพศ</label><input {...register('gender')} readOnly className={inputClass} /></div>
                  <div className="sm:col-span-2"><label>วัน/เดือน/ปีเกิด</label><Controller control={control} name="birthDate" render={({ field }) => (<DatePicker locale="th" selected={field.value} onChange={(date: Date | null) => field.onChange(date)} maxDate={new Date()} dateFormat="dd/MM/yyyy" className={inputClass} placeholderText="วว/ดด/พศ" renderCustomHeader={(props) => <CustomHeader {...props} />} />)} />{errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate.message}</p>}</div>
                  <div className="sm:col-span-1"><label>กรุ๊ปเลือด</label><select {...register('bloodType')} className={inputClass}><option value="">-</option><option>A</option><option>B</option><option>AB</option><option>O</option></select></div>
                  <div className="sm:col-span-1"><label>อายุ</label><input value={calculatedAge != null ? `${calculatedAge} ปี` : ''} readOnly className={inputClass} /></div>

                  {/* ID Card Address */}
                  <div className="sm:col-span-6"><h4 className="font-medium text-gray-800">ที่อยู่ตามบัตรประชาชน</h4></div>
                  <div className="sm:col-span-2"><label>บ้านเลขที่</label><input {...register('idCardAddress_houseNumber')} className={inputClass} />{errors.idCardAddress_houseNumber && <p className="text-red-500 text-xs mt-1">{errors.idCardAddress_houseNumber.message}</p>}</div>
                  <div className="sm:col-span-1"><label>หมู่ที่</label><select {...register('idCardAddress_moo')} className={inputClass}><option value="">--</option>{Array.from({length: 20}, (_, i) => i + 1).map(n => <option key={n}>{n}</option>)}</select>{errors.idCardAddress_moo && <p className="text-red-500 text-xs mt-1">{errors.idCardAddress_moo.message}</p>}</div>
                  <div className="sm:col-span-3"><label>เบอร์โทร</label><input type="tel" {...register('idCardAddress_phone')} className={inputClass} />{errors.idCardAddress_phone && <p className="text-red-500 text-xs mt-1">{errors.idCardAddress_phone.message}</p>}</div>
                  <div className="sm:col-span-2"><label>ตำบล</label><input {...register('idCardAddress_tambon')} defaultValue="เวียง" className={inputClass} />{errors.idCardAddress_tambon && <p className="text-red-500 text-xs mt-1">{errors.idCardAddress_tambon.message}</p>}</div>
                  <div className="sm:col-span-2"><label>อำเภอ</label><input {...register('idCardAddress_amphoe')} defaultValue="ฝาง" className={inputClass} />{errors.idCardAddress_amphoe && <p className="text-red-500 text-xs mt-1">{errors.idCardAddress_amphoe.message}</p>}</div>
                  <div className="sm:col-span-2"><label>จังหวัด</label><input {...register('idCardAddress_changwat')} defaultValue="เชียงใหม่" className={inputClass} />{errors.idCardAddress_changwat && <p className="text-red-500 text-xs mt-1">{errors.idCardAddress_changwat.message}</p>}</div>

                  {/* Current Address */}
                  <div className="sm:col-span-6"><h4 className="font-medium text-gray-800">ที่อยู่ปัจจุบัน</h4></div>
                  <div className="sm:col-span-6"><div className="relative flex items-start"><div className="flex h-6 items-center"><input {...register('useIdCardAddress')} type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" /></div><div className="ml-3 text-sm leading-6"><label className="font-medium text-gray-900">ใช้ที่อยู่ตามบัตรประชาชน</label></div></div></div>
                  <div className="sm:col-span-2"><label>บ้านเลขที่</label><input {...register('currentAddress_houseNumber')} disabled={watchUseIdCardAddress} className={inputClass} />{errors.currentAddress_houseNumber && <p className="text-red-500 text-xs mt-1">{errors.currentAddress_houseNumber.message}</p>}</div>
                  <div className="sm:col-span-1"><label>หมู่ที่</label><select {...register('currentAddress_moo')} disabled={watchUseIdCardAddress} className={inputClass}><option value="">--</option>{Array.from({length: 20}, (_, i) => i + 1).map(n => <option key={n}>{n}</option>)}</select>{errors.currentAddress_moo && <p className="text-red-500 text-xs mt-1">{errors.currentAddress_moo.message}</p>}</div>
                  <div className="sm:col-span-3"><label>เบอร์โทร</label><input type="tel" {...register('currentAddress_phone')} disabled={watchUseIdCardAddress} className={inputClass} /></div>
                  <div className="sm:col-span-2"><label>ตำบล</label><input {...register('currentAddress_tambon')} disabled={watchUseIdCardAddress} defaultValue="เวียง" className={inputClass} /></div>
                  <div className="sm:col-span-2"><label>อำเภอ</label><input {...register('currentAddress_amphoe')} disabled={watchUseIdCardAddress} defaultValue="ฝาง" className={inputClass} /></div>
                  <div className="sm:col-span-2"><label>จังหวัด</label><input {...register('currentAddress_changwat')} disabled={watchUseIdCardAddress} defaultValue="เชียงใหม่" className={inputClass} /></div>
                  
                  {/* Other Info */}
                  <div className="sm:col-span-3"><label>กลุ่มผู้ป่วย</label><select {...register('patientGroup')} className={inputClass}><option value="">--เลือก--</option><option>ผู้ยากไร้</option><option>ผู้ป่วยติดเตียง</option><option>อื่นๆ</option></select></div>
                  {watchPatientGroup === 'อื่นๆ' && <div className="sm:col-span-3"><label>ระบุกลุ่มผู้ป่วยอื่นๆ</label><input {...register('otherPatientGroup')} className={inputClass} />{errors.otherPatientGroup && <p className="text-red-500 text-xs mt-1">{errors.otherPatientGroup.message}</p>}</div>}
                  <div className="sm:col-span-6"><label>ข้อมูลสุขภาพเบื้องต้น</label><textarea {...register('basicHealthInfo')} rows={3} className={inputClass} /></div>

                  {/* Map */}
                  <div className="sm:col-span-6"><label>ตำแหน่งรับผู้ป่วย</label><MapPicker onLocationChange={handleLocationChange} />{errors.pickupLocation_lat && <p className="text-red-500 text-xs mt-1">{errors.pickupLocation_lat.message}</p>}</div>
                  <div className="sm:col-span-6"><label>หมายเหตุ/จุดสังเกต</label><textarea {...register('notes')} rows={2} className={inputClass} /></div>
                
                </div>

                {apiError && <div className="mt-4 rounded-md bg-red-50 p-4"><p className="text-sm text-red-700">{apiError}</p></div>}
                {isSuccess && <div className="mt-4 rounded-md bg-green-50 p-4"><p className="text-sm text-green-700">เพิ่มข้อมูลผู้ป่วยสำเร็จ!</p></div>}

                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button type="submit" disabled={isSubmitting || (watchNationalId && !isValidThaiID(watchNationalId))} className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed sm:col-start-2">
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        กำลังบันทึก...
                      </>
                    ) : 'บันทึกข้อมูล'}
                  </button>
                  <button type="button" onClick={onClose} className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0">ยกเลิก</button>
                </div>
              </form>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
