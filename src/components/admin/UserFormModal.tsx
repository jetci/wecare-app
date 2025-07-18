'use client';

import React, { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Role } from '@prisma/client';
import { userFormSchema, type UserFormData } from '@/schemas/user.schema';
import { useAuth } from '@/context/AuthContext';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, onUserAdded }) => {
  const { token } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      approved: true,
      role: Role.COMMUNITY,
    }
  });

  useEffect(() => {
    if (!isOpen) {
      reset({
        firstName: '',
        lastName: '',
        nationalId: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: Role.COMMUNITY,
        approved: true,
      });
      setApiError(null);
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: UserFormData) => {
    setApiError(null);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.error || 'ไม่สามารถสร้างผู้ใช้ได้');
      }

      alert('สร้างผู้ใช้ใหม่สำเร็จ!');
      onUserAdded();
      onClose();

    } catch (error: any) {
      setApiError(error.message);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enterTo="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 translate-y-0 sm:scale-100" leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                    สร้างผู้ใช้ใหม่
                  </Dialog.Title>
                  <div className="mt-4 grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4">
                    {/* ฟอร์มฟิลด์ต่างๆ */}
                    <div className="sm:col-span-1">
                      <label className="block text-sm font-medium text-gray-700">ชื่อจริง</label>
                      <input {...register('firstName')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                      {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                    </div>
                    {/* ... ฟิลด์อื่นๆ คล้ายกัน ... */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">บทบาท</label>
                      <select {...register('role')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                        {Object.values(Role).filter(r => r !== 'DEVELOPER').map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>
                    {apiError && <p className="text-red-500 text-sm sm:col-span-2">{apiError}</p>}
                  </div>
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                    <button type="submit" disabled={isSubmitting} className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:bg-indigo-300 sm:col-start-2">
                      {isSubmitting ? 'กำลังสร้าง...' : 'สร้างผู้ใช้'}
                    </button>
                    <button type="button" onClick={onClose} className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0">
                      ยกเลิก
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};