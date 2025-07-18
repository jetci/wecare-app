"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "กรุณาระบุชื่อ–สกุล"),
  phone: z.string().min(1, "กรุณาระบุเบอร์โทรศัพท์"),
  origin: z.string().min(1, "กรุณาระบุต้นทาง"),
  destination: z.string().min(1, "กรุณาระบุปลายทาง"),
  datetime: z.string().min(1, "กรุณาเลือกวันที่และเวลา"),
  serviceType: z.string().min(1, "กรุณาเลือกประเภทบริการ"),
  companions: z
    .number()
    .min(0, "จำนวนผู้โดยสารต้องไม่ติดลบ")
    .default(0),
  notes: z.string().optional(),
  attachments: z.any().optional(),
});

type FormData = z.infer<typeof schema>;

export default function CommunityRequestForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { companions: 0 },
  });

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  const onSubmit = async (data: FormData) => {
    // Integrate API POST /api/community/requests
    setSubmitError(null);
    setSubmitSuccess(false);
    try {
      const res = await fetch('/api/community/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorRes = await res.json();
        throw new Error(errorRes.error || 'ไม่สามารถสร้างคำขอได้');
      }
      setSubmitSuccess(true);
      reset();
    } catch (e: any) {
      setSubmitError(e.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {submitError && <p className="text-red-600">{submitError}</p>}
      {submitSuccess && <p className="text-green-600">สร้างคำขอสำเร็จ</p>}
      {/* Section 1: User Info */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">ข้อมูลผู้ขอรับบริการ</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ–สกุล</label>
            <input
              {...register("name")}
              className="w-full p-3 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
            <input
              {...register("phone")}
              className="w-full p-3 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>}
          </div>
        </div>
      </div>

      {/* Section 2: Travel Details */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">รายละเอียดการเดินทาง</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ต้นทาง</label>
            <input
              {...register("origin")}
              className="w-full p-3 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.origin && <p className="text-red-600 text-sm mt-1">{errors.origin.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ปลายทาง</label>
            <input
              {...register("destination")}
              className="w-full p-3 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.destination && <p className="text-red-600 text-sm mt-1">{errors.destination.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">วันที่ & เวลา</label>
            <input
              type="datetime-local"
              {...register("datetime")}
              className="w-full p-3 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.datetime && <p className="text-red-600 text-sm mt-1">{errors.datetime.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทบริการ</label>
            <select
              {...register("serviceType")}
              className="w-full p-3 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">-- เลือกประเภท --</option>
              <option value="normal">ปกติ</option>
              <option value="urgent">ด่วน</option>
            </select>
            {errors.serviceType && <p className="text-red-600 text-sm mt-1">{errors.serviceType.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ผู้โดยสารเพิ่มเติม (คน)</label>
            <input
              type="number"
              min={0}
              {...register("companions", { valueAsNumber: true })}
              className="w-full p-3 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Additional & Attachments */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">เพิ่มเติม & เอกสารแนบ</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
            <textarea
              {...register("notes")}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">อัปโหลดเอกสาร</label>
            <input
              type="file"
              {...register("attachments")}
              multiple
              className="w-full text-gray-600"
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50"
      >
        ส่งคำขอ
      </button>
    </form>
  );
}
