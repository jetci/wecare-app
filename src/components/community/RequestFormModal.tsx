'use client';

import React, { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { requestFormSchema, type RequestFormData } from '@/schemas/community/request.schema';
import { useAuth } from '@/context/AuthContext';
import { usePatients } from '@/hooks/usePatients';

interface RequestFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RequestFormModal: React.FC<RequestFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { token } = useAuth();
  const { patients, isLoading: patientsLoading } = usePatients();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    control,
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
      const res = await fetch('/api/community/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'ไม่สามารถสร้างคำขอได้ กรุณาลองใหม่');
      }
      alert('สร้างคำขอสำเร็จ!');
      onSuccess();
      onClose();
    } catch (e: any) {
      setApiError(e.message);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
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

        {/* Modal */}
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
                  {/* Patient Selector */}
                  {patients.length > 0 && (
                    <div className="mb-4">
                      <label htmlFor="patientId" className="block text-sm font-medium text-gray-700">
                        เลือกผู้ป่วย (ถ้ามี)
                      </label>
                      <Controller
                        name="patientId"
                        control={control}
                        render={({ field }) => (
                          <select
                            {...field}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="">-- เลือก --</option>
                            {patients.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        )}
                      />
                      {errors.patientId && (
                        <p className="text-red-500 text-xs mt-1">{errors.patientId.message}</p>
                      )}
                    </div>
                  )}

                  {/* Type */}
                  <div className="mb-4">
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                      ประเภทคำขอ
                    </label>
                    <select
                      id="type"
                      {...register('type')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">-- เลือกประเภท --</option>
                      <option value="MEDICAL">รักษาพยาบาล</option>
                      <option value="TRANSPORT">รับส่ง</option>
                      <option value="OTHER">อื่น ๆ</option>
                    </select>
                    {errors.type && (
                      <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>
                    )}
                  </div>

                  {/* Title */}
                  <div className="mb-4">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      หัวข้อ
                    </label>
                    <input
                      id="title"
                      {...register('title')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.title && (
                      <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      รายละเอียดเพิ่มเติม (ถ้ามี)
                    </label>
                    <textarea
                      id="description"
                      {...register('description')}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.description && (
                      <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
                    )}
                  </div>

                  {/* API Error */}
                  {apiError && (
                    <div className="mb-4 rounded-md bg-red-50 p-4">
                      <p className="text-sm text-red-700">{apiError}</p>
                    </div>
                  )}

                  {/* Buttons */}
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