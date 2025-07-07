"use client";

import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { toast } from 'react-hot-toast'; // Assuming this is installed and configured

// SA Specified: ชื่อห้ามว่าง, เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก
// Adding lastName as required for good practice.
const profileEditSchema = z.object({
  firstName: z.string().min(1, { message: 'ชื่อห้ามว่าง' }),
  lastName: z.string().min(1, { message: 'นามสกุลห้ามว่าง' }),
  phone: z.string()
    .length(10, { message: 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก' })
    .regex(/^\d+$/, { message: 'เบอร์โทรศัพท์ต้องเป็นตัวเลขเท่านั้น' }),
  document: z
    .any()
    .refine((files: FileList) => (files?.length ?? 0) === 1, { message: 'กรุณาเลือกไฟล์เอกสาร' })
    .refine((files: FileList) => (files?.length ?? 0) === 0 || ['application/pdf','image/jpeg','image/png'].includes(files?.[0]?.type ?? ''), { message: 'ไฟล์ต้องเป็น PDF หรือรูปภาพ JPG/PNG' }),
});

type ProfileEditFormValues = z.infer<typeof profileEditSchema>;

// Fetcher for current profile data (used by SWR)
const fetcher = async (url: string) => {
  const token = localStorage.getItem("accessToken"); 
  if (!token) {
    throw new Error("Authentication token not found.");
  }
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the profile data.');
    if (res.status === 401 || res.status === 403) {
      // Specific error for auth issues, could trigger redirect in component
      error.message = 'Unauthorized or Forbidden'; 
    }
    throw error;
  }
  return res.json();
};

// API function to update profile
// SA Specified API: /api/user/update-profile
const updateUserProfileAPI = async (data: ProfileEditFormValues) => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("Authentication token not found. Cannot update profile.");
  }
  const fd = new FormData();
  fd.append('firstName', data.firstName);
  fd.append('lastName', data.lastName);
  fd.append('phone', data.phone);
  if (data.document && data.document.length) {
    fd.append('document', data.document[0]);
  }
  const res = await fetch('/api/user/update-profile', { 
    method: 'PUT', 
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: fd,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Failed to update profile and parse error response.' }));
    throw new Error(errorData.message || 'Failed to update profile.');
  }
  return res.json(); 
};

export default function EditProfilePage() {
  const router = useRouter();
  const { data: currentProfile, error: fetchProfileError, isLoading: isLoadingProfile } = useSWR(
    '/api/auth/profile', 
    fetcher,
    {
      onError: (error) => {
        if (error.message === 'Unauthorized or Forbidden' || error.message === 'Authentication token not found.') {
          toast.error('กรุณาเข้าสู่ระบบเพื่อแก้ไขข้อมูลส่วนตัว');
          router.push('/login'); // Call directly
        }
      }
    }
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, dirtyFields }, 
  } = useForm<ProfileEditFormValues>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      document: undefined,
    },
  });

  useEffect(() => {
    const profileSource = currentProfile?.user || currentProfile;
    if (profileSource) { 
      reset({
        firstName: profileSource.firstName || '',
        lastName: profileSource.lastName || '',
        phone: profileSource.phone || '',
      });
    }
  }, [currentProfile, reset]);

  const onSubmitHandler: SubmitHandler<ProfileEditFormValues> = async (formData) => {
    try {
      await updateUserProfileAPI(formData);
      toast.success('โปรไฟล์ถูกอัปเดตเรียบร้อยแล้ว');
      router.push('/profile'); 
    } catch (error) {
      console.log('[DEBUG EditProfilePage onSubmitHandler CATCH]', error);
      toast.error(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleCancel = () => {
    const profileSource = currentProfile?.user || currentProfile;
    if (profileSource) {
      reset({
        firstName: profileSource.firstName || '',
        lastName: profileSource.lastName || '',
        phone: profileSource.phone || '',
      });
    } else {
      reset({ firstName: '', lastName: '', phone: '', document: undefined });
    }
  };

  if (isLoadingProfile) {
    return <div className="flex justify-center items-center h-screen"><p>กำลังโหลดข้อมูลโปรไฟล์...</p></div>;
  }

  if (fetchProfileError && !currentProfile) { // Show error only if data is not available and an error occurred
    // Error handling in SWR's onError should manage redirects for auth issues
    return <div className="p-6 text-center text-red-500">ไม่สามารถโหลดข้อมูลโปรไฟล์ได้: {fetchProfileError.message}</div>;
  }
  
  if (!currentProfile && !isLoadingProfile && !fetchProfileError) {
    return <div className="p-6 text-center text-red-500">ไม่พบข้อมูลผู้ใช้</div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-lg">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-800 text-center">แก้ไขข้อมูลส่วนตัว</h1>
      <form data-testid="edit-profile-form" onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6 bg-white p-6 sm:p-8 shadow-xl rounded-lg">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            ชื่อ <span className="text-red-500">*</span>
          </label>
          <input
            id="firstName"
            type="text"
            {...register('firstName')}
            className={`mt-1 block w-full px-3 py-2 border ${errors.firstName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} rounded-md shadow-sm sm:text-sm`}
          />
          {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            นามสกุล <span className="text-red-500">*</span>
          </label>
          <input
            id="lastName"
            type="text"
            {...register('lastName')}
            className={`mt-1 block w-full px-3 py-2 border ${errors.lastName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} rounded-md shadow-sm sm:text-sm`}
          />
          {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            เบอร์โทรศัพท์ <span className="text-red-500">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            {...register('phone')}
            className={`mt-1 block w-full px-3 py-2 border ${errors.phone ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} rounded-md shadow-sm sm:text-sm`}
            placeholder="0812345678"
          />
          {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
        </div>

        <div>
          <label htmlFor="document" className="block text-sm font-medium text-gray-700 mb-1">
            เอกสารผู้ป่วย <span className="text-red-500">*</span>
          </label>
          <input
            id="document"
            type="file"
            accept="application/pdf,image/*"
            {...register('document')}
            className="mt-1 block w-full"
          />
          {errors.document?.message && <p className="mt-1 text-xs text-red-600">{String(errors.document.message)}</p>}
        </div>

        <div className="flex flex-col sm:flex-row-reverse sm:justify-start gap-3 pt-4">
          <button data-testid="save-button"
            type="submit"
            disabled={isSubmitting || !Object.keys(dirtyFields).length} 
            className="w-full sm:w-auto inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
          </button>
          <button data-testid="cancel-button"
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60"
          >
            ยกเลิก
          </button>
        </div>
      </form>
    </div>
  );
}
