"use client";

import React, { Fragment, useState, useEffect, useCallback } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm, Controller, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { patientFormSchema, type PatientFormData } from '@/schemas/community/patient.schema';
import { useAuth } from '@/context/AuthContext';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import DatePicker, { registerLocale } from 'react-datepicker';
import { th } from 'date-fns/locale/th';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';

registerLocale('th', th);

// [SA-IMPROVEMENT] กำหนด Class สำหรับ Input field ไว้ที่เดียวเพื่อความสอดคล้อง
const inputClass = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed";

const containerStyle = { width: '100%', height: '300px', borderRadius: '8px' };

// Custom input to display BE year
const BEInput = React.forwardRef<HTMLInputElement, any>(({ value, onClick, placeholder }, ref) => {
  let display = '';
  if (value) {
    const parts = value.split('/');
    if (parts.length === 3) {
      const year = parseInt(parts[2], 10);
      display = `${parts[0]}/${parts[1]}/${year + 543}`;
    } else display = value;
  }
  return <input ref={ref} className={inputClass} onClick={onClick} value={display} placeholder={placeholder} readOnly />;
});
const libraries: ("places")[] = ["places"];

const MapPicker = ({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) => {
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });
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
    <GoogleMap mapContainerStyle={containerStyle} center={currentPosition || undefined} zoom={15} mapTypeId="satellite">
      {currentPosition && <Marker position={currentPosition} draggable={true} onDragEnd={onMarkerDragEnd} />}
    </GoogleMap>
  );
};

export const AddPatientModal = ({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void; }) => {
  const { token } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema)
  });

  const watchPrefix = watch('prefix');

  useEffect(() => {
    if (['นาย', 'เด็กชาย'].includes(watchPrefix)) setValue('gender', 'ชาย');
    else if (['นาง', 'นางสาว', 'เด็กหญิง'].includes(watchPrefix)) setValue('gender', 'หญิง');
  }, [watchPrefix, setValue]);
  
  const watchUseIdCardAddress = watch('useIdCardAddress');
  const watchIdCardAddress = watch(['idCardAddress_houseNumber', 'idCardAddress_moo', 'idCardAddress_phone']);
  useEffect(() => { if (watchUseIdCardAddress) { /* sync current address */ } }, [watchUseIdCardAddress, watchIdCardAddress, setValue]);
  useEffect(() => { if (!isOpen) { reset(); setApiError(null); } }, [isOpen, reset]);
  const onSubmit = async (data: PatientFormData) => { /* submit logic */ };
  const handleLocationChange = useCallback((lat: number, lng: number) => { setValue('pickupLocation_lat', lat); setValue('pickupLocation_lng', lng); }, [setValue]);

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
                  <div className="sm:col-span-1"><label>เพศ</label><input {...register('gender')} disabled className={inputClass} /></div>
                  
                  {/* Date of Birth */}
                  <div className="sm:col-span-2">
                    <label>วัน/เดือน/ปีเกิด</label>
                    <Controller
                      control={control}
                      name="birthDate"
                      render={({ field }) => (
                        <DatePicker
                          locale="th"
                          customInput={<BEInput />}
                          renderCustomHeader={({ date, changeYear, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled }) => (
                            <div className="flex items-center justify-between px-2 py-1 bg-gray-100">
                              <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>&lt;</button>
                              <select value={date.getFullYear()} onChange={(e) => changeYear(Number(e.target.value))} className="mx-2">
                                {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                                  <option key={year} value={year}>{year + 543}</option>
                                ))}
                              </select>
                              <span className="mx-2">{format(date, 'MMMM', { locale: th })}</span>
                              <button onClick={increaseMonth} disabled={nextMonthButtonDisabled}>&gt;</button>
                            </div>
                          )}
                          placeholderText="DD/MM/YYYY"
                          selected={field.value as Date}
                          onChange={(date) => field.onChange(date as Date)}
                          dateFormat="dd/MM/yyyy"
                          maxDate={new Date()}
                        />
                      )}
                    />

                    {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate.message}</p>}
                  </div>
                  
                  <div className="sm:col-span-1"><label>กรุ๊ปเลือด</label><select {...register('bloodType')} className={inputClass}><option value="">-</option><option>A</option><option>B</option><option>AB</option><option>O</option></select></div>

                  {/* ID Card Address */}
                  <div className="sm:col-span-6"><h4 className="font-medium text-gray-800">ที่อยู่ตามบัตรประชาชน</h4></div>
                  <div className="sm:col-span-2"><label>บ้านเลขที่</label><input {...register('idCardAddress_houseNumber')} className={inputClass} />{errors.idCardAddress_houseNumber && <p className="text-red-500 text-xs mt-1">{errors.idCardAddress_houseNumber.message}</p>}</div>
                  <div className="sm:col-span-1"><label>หมู่ที่</label><select {...register('idCardAddress_moo')} className={inputClass}><option value="">--</option>{Array.from({length: 20}, (_, i) => i + 1).map(n => <option key={n}>{n}</option>)}</select>{errors.idCardAddress_moo && <p className="text-red-500 text-xs mt-1">{errors.idCardAddress_moo.message}</p>}</div>
                  <div className="sm:col-span-3"><label>เบอร์โทร</label><input type="tel" {...register('idCardAddress_phone')} className={inputClass} />{errors.idCardAddress_phone && <p className="text-red-500 text-xs mt-1">{errors.idCardAddress_phone.message}</p>}</div>
                  <div className="sm:col-span-2"><label>ตำบล</label><input value="เวียง" disabled className={inputClass} /></div>
                  <div className="sm:col-span-2"><label>อำเภอ</label><input value="ฝาง" disabled className={inputClass} /></div>
                  <div className="sm:col-span-2"><label>จังหวัด</label><input value="เชียงใหม่" disabled className={inputClass} /></div>

                  {/* Current Address */}
                  <div className="sm:col-span-6"><h4 className="font-medium text-gray-800">ที่อยู่ปัจจุบัน</h4></div>
                  <div className="sm:col-span-6"><div className="relative flex items-start"><div className="flex h-6 items-center"><input {...register('useIdCardAddress')} type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" /></div><div className="ml-3 text-sm leading-6"><label className="font-medium text-gray-900">ใช้ที่อยู่ตามบัตรประชาชน</label></div></div></div>
                  {/* Current address fields with inputClass and disabled prop */}
                  {/* Current Address Fields */}
                  <div className="sm:col-span-2"><label>บ้านเลขที่ (ปัจจุบัน)</label><input {...register('currentAddress_houseNumber')} disabled={watchUseIdCardAddress} className={inputClass} />{errors.currentAddress_houseNumber && <p className="text-red-500 text-xs mt-1">{errors.currentAddress_houseNumber.message}</p>}</div>
                  <div className="sm:col-span-1"><label>หมู่ที่ (ปัจจุบัน)</label><select {...register('currentAddress_moo')} disabled={watchUseIdCardAddress} className={inputClass}><option value="">--</option>{Array.from({length:20},(_,i)=>i+1).map(n=> <option key={n}>{n}</option>)}</select>{errors.currentAddress_moo && <p className="text-red-500 text-xs mt-1">{errors.currentAddress_moo.message}</p>}</div>
                  <div className="sm:col-span-2"><label>ตำบล (ปัจจุบัน)</label><input {...register('currentAddress_tambon')} disabled={watchUseIdCardAddress} className={inputClass} />{errors.currentAddress_tambon && <p className="text-red-500 text-xs mt-1">{errors.currentAddress_tambon.message}</p>}</div>
                  <div className="sm:col-span-2"><label>อำเภอ (ปัจจุบัน)</label><input {...register('currentAddress_amphoe')} disabled={watchUseIdCardAddress} className={inputClass} />{errors.currentAddress_amphoe && <p className="text-red-500 text-xs mt-1">{errors.currentAddress_amphoe.message}</p>}</div>
                  <div className="sm:col-span-2"><label>จังหวัด (ปัจจุบัน)</label><input {...register('currentAddress_changwat')} disabled={watchUseIdCardAddress} className={inputClass} />{errors.currentAddress_changwat && <p className="text-red-500 text-xs mt-1">{errors.currentAddress_changwat.message}</p>}</div>
                  <div className="sm:col-span-3"><label>เบอร์โทร (ปัจจุบัน)</label><input type="tel" {...register('currentAddress_phone')} disabled={watchUseIdCardAddress} className={inputClass} />{errors.currentAddress_phone && <p className="text-red-500 text-xs mt-1">{errors.currentAddress_phone.message}</p>}</div>
                  {/* Patient Group */}
                  <div className="sm:col-span-3"><label>กลุ่มผู้ป่วย</label><select {...register('patientGroup')} className={inputClass}><option value="ผู้ยากไร้">ผู้ยากไร้</option><option value="ผู้ป่วยติดเตียง">ผู้ป่วยติดเตียง</option><option value="อื่นๆ">อื่นๆ</option></select>{errors.patientGroup && <p className="text-red-500 text-xs mt-1">{errors.patientGroup.message}</p>}</div>
                  {watch('patientGroup') === 'อื่นๆ' && (
                    <div className="sm:col-span-3"><label>โปรดระบุ</label><input {...register('otherPatientGroup')} className={inputClass} />{errors.otherPatientGroup && <p className="text-red-500 text-xs mt-1">{errors.otherPatientGroup.message}</p>}</div>
                  )}

                  {/* ... */}
                  
                  {/* Other Info */}
                  <div className="sm:col-span-6"><label>ข้อมูลสุขภาพเบื้องต้น</label><textarea {...register('basicHealthInfo')} rows={3} className={inputClass} /></div>

                  {/* Map */}
                  <div className="sm:col-span-6"><label>ตำแหน่งรับผู้ป่วย</label><MapPicker onLocationChange={handleLocationChange} />{errors.pickupLocation_lat && <p className="text-red-500 text-xs mt-1">{errors.pickupLocation_lat.message}</p>}</div>
                  <div className="sm:col-span-6"><label>หมายเหตุ/จุดสังเกต</label><textarea {...register('notes')} rows={2} className={inputClass} /></div>
                </div>

                {apiError && <div className="mt-4 rounded-md bg-red-50 p-4"><p className="text-sm text-red-700">{apiError}</p></div>}

                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button type="submit" disabled={isSubmitting} className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:bg-indigo-400 sm:col-start-2">{isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}</button>
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
