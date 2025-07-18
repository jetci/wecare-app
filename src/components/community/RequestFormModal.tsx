'use client';

import React, { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { requestFormSchema, type RequestFormData } from '@/schemas/community/request.schema';
import { useAuth } from '@/context/AuthContext';

interface RequestFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RequestFormModal = ({ isOpen, onClose, onSuccess }: RequestFormModalProps) => {
  const { token } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestFormSchema),
  });

  useEffect(() => {
    if (isOpen) {
      reset();
      setApiError(null);
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: RequestFormData) => {
    setApiError(null);
    try {
      const response = await fetch('/api/community/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.error || 'ไม่สามารถสร้างคำขอได้ กรุณาลองใหม่');
      }

      alert('สร้างคำขอสำเร็จ!');
      onSuccess();
      onClose();
    } catch (error: any) {
      setApiError(error.message);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                    สร้างคำขอรับบริการใหม่
                  </Dialog.Title>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                        ประเภทบริการ
                      </label>
                      <select
                        id="type"
                        {...register('type')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">-- กรุณาเลือก --</option>
                        <option value="EMERGENCY_VEHICLE">ขอรถพยาบาลฉุกเฉิน</option>
                        <option value="HEALTH_CHECKUP">นัดหมายตรวจสุขภาพ</option>
                        <option value="VACCINATION">ขอรับวัคซีน</option>
                      </select>
                      {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
                    </div>

                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        หัวข้อ/อาการเบื้องต้น
                      </label>
                      <input
                        id="title"
                        {...register('title')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        รายละเอียดเพิ่มเติม (ถ้ามี)
                      </label>
                      <textarea
                        id="description"
                        {...register('description')}
                        rows={4}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                    </div>

                    {apiError && (
                      <div className="rounded-md bg-red-50 p-4">
                        <p className="text-sm text-red-700">{apiError}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:bg-indigo-400 sm:col-start-2"
                    >
                      {isSubmitting ? 'กำลังส่ง...' : 'ส่งคำขอ'}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                    >
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
