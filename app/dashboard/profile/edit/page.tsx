'use client';

import React, { useEffect, useState, useMemo, ChangeEvent, FormEvent } from 'react';
import useSWR from 'swr';
import authFetcher from '@/lib/authFetcher';
import { useRouter } from 'next/navigation';

interface ProfileData {
  user: {
    email: string; // อีเมล
    prefix: string;
    firstName: string;
    lastName: string;
    nationalId: string;
    phone: string;
    avatarUrl: string;
    role: string;
    address: {
      houseNumber: string;
      village: string;
      subdistrict: string;
      district: string;
      province: string;
    };
  };
}

export default function EditUserProfilePage() {
  const router = useRouter();
  const { data, error } = useSWR<ProfileData>('/api/auth/profile', authFetcher);
  const [formState, setFormState] = useState({
    prefix: '', firstName: '', lastName: '', phone: '',
    houseNumber: '', village: '', subDistrict: '', district: '', province: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    if (data) {
      const u = data.user;
      setFormState({
        prefix: u.prefix || '',
        firstName: u.firstName,
        lastName: u.lastName,
        phone: u.phone || '',
        houseNumber: u.address.houseNumber || '',
        village: u.address.village || '',
        subDistrict: u.address.subdistrict || '',
        district: u.address.district || '',
        province: u.address.province || '',
      });
    }
  }, [data]);

  if (error) return <div className="p-6 text-red-500">Error loading profile</div>;
  if (!data) return <div className="p-6">Loading...</div>;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setAvatarFile(e.target.files[0]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('prefix', formState.prefix);
    formData.append('firstName', formState.firstName);
    formData.append('lastName', formState.lastName);
    formData.append('phone', formState.phone);
    formData.append('houseNumber', formState.houseNumber);
    formData.append('village', formState.village);
    formData.append('subDistrict', formState.subDistrict);
    formData.append('district', formState.district);
    formData.append('province', formState.province);
    if (avatarFile) formData.append('avatar', avatarFile);

    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      body: formData,
    });
    if (res.ok) {
      router.push('/dashboard/profile');
    } else {
      alert('Failed to update profile');
    }
  };

  const { user } = data;
  // Preview selected avatar before upload
  const avatarPreview = useMemo(() => {
    if (avatarFile) {
      return URL.createObjectURL(avatarFile);
    }
    return user.avatarUrl || '/default-avatar.png';
  }, [avatarFile, user.avatarUrl]);
  // Cleanup object URL on unmount or file change
  useEffect(() => {
    return () => {
      if (avatarFile) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarFile, avatarPreview]);
  
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">แก้ไขข้อมูลส่วนตัว</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center space-x-4">
          <img src={avatarPreview} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">คำนำหน้า</label>
            <input name="prefix" value={formState.prefix} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">สิทธิ์</label>
            <input value={user.role} readOnly className="mt-1 block w-full border bg-gray-100 rounded p-2" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">ชื่อ</label>
            <input name="firstName" value={formState.firstName} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">นามสกุล</label>
            <input name="lastName" value={formState.lastName} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">หมายเลขบัตรประชาชน</label>
          <input value={user.nationalId} readOnly className="mt-1 block w-full border bg-gray-100 rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">อีเมล</label>
          <input value={user.email} readOnly className="mt-1 block w-full border bg-gray-100 rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">เบอร์โทรศัพท์</label>
          <input name="phone" value={formState.phone} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">บ้านเลขที่</label>
            <input name="houseNumber" value={formState.houseNumber} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">หมู่ที่</label>
            <input name="village" value={formState.village} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">ตำบล</label>
            <input name="subDistrict" value={formState.subDistrict} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">อำเภอ</label>
            <input name="district" value={formState.district} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium">จังหวัด</label>
            <input name="province" value={formState.province} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
          </div>
        </div>
        <div>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500">
            บันทึก
          </button>
        </div>
      </form>
    </div>
  );
}
