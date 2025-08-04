'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useSWR from 'swr';
import authFetcher from '@/lib/authFetcher';
import { useRouter } from 'next/navigation';
import { UserProfileSchema, UserProfileForm } from '@/schemas/userProfile.schema';

export default function EditUserProfilePage() {
  const router = useRouter();
  const { data, error } = useSWR('/api/auth/profile', authFetcher);
  const [avatarPreview, setAvatarPreview] = useState<string>('/default-avatar.png');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UserProfileForm>({
    resolver: zodResolver(UserProfileSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      nationalId: '',
      birthDate: '',
      avatarFile: undefined,
    },
  });

  const avatarFile = watch('avatarFile');

  useEffect(() => {
    if (data) {
      const { user } = data;
      reset({
        fullName: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        phone: user.phone || '',
        nationalId: user.nationalId,
        birthDate: user.birthDate || '',
        avatarFile: undefined,
      });
      setAvatarPreview(user.avatarUrl || '/default-avatar.png');
    }
  }, [data, reset]);

  useEffect(() => {
    if (avatarFile instanceof File) {
      const url = URL.createObjectURL(avatarFile);
      setAvatarPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [avatarFile]);

  const onSubmit = async (values: UserProfileForm & { avatarFile?: File }) => {
    setSubmitError(null);
    const formData = new FormData();
    formData.append('fullName', values.fullName);
    formData.append('phone', values.phone ?? '');
    formData.append('nationalId', values.nationalId);
    formData.append('birthDate', values.birthDate);
    if (values.avatarFile) formData.append('avatar', values.avatarFile as File);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        body: formData,
      });
      if (!res.ok) throw new Error('Update failed');
      router.push('/dashboard/profile');
    } catch (err: any) {
      setSubmitError(err.message || 'Update failed. Please try again');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">แก้ไขข้อมูลส่วนตัว</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex items-center space-x-4">
          <img src={avatarPreview} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
          <input type="file" accept="image/*" {...register('avatarFile')} />
        </div>
        {errors.avatarFile && <p className="text-red-500 text-sm">{errors.avatarFile.message}</p>}

        <div>
          <label className="block text-sm font-medium">ชื่อ-นามสกุล</label>
          <input {...register('fullName')} className="mt-1 block w-full border rounded p-2" />
          {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">อีเมล</label>
          <input
            type="email"
            {...register('email')}
            readOnly
            className="mt-1 block w-full border bg-gray-100 rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">โทรศัพท์</label>
          <input {...register('phone')} className="mt-1 block w-full border rounded p-2" />
          {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">เลขบัตรประชาชน</label>
          <input {...register('nationalId')} className="mt-1 block w-full border rounded p-2" />
          {errors.nationalId && <p className="text-red-500 text-sm">{errors.nationalId.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">วันเกิด</label>
          <input
            type="date"
            {...register('birthDate')}
            max={new Date().toISOString().split('T')[0]}
            className="mt-1 block w-full border rounded p-2"
          />
          {errors.birthDate && <p className="text-red-500 text-sm">{errors.birthDate.message}</p>}
          {submitError && <p className="text-red-500 text-sm">{submitError}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 flex items-center"
        >
          {isSubmitting && <span className="loader mr-2"></span>}
          บันทึก
        </button>
      </form>
    </div>
  );
}