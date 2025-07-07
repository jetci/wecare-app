"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateCommunityRequestBodySchema } from "@/schemas/community.schema";
import { z } from "zod";

// สร้าง schema สำหรับฟอร์ม (ไม่ต้องมี id, createdAt)
type FormValues = z.infer<typeof CreateCommunityRequestBodySchema>;

const defaultValues: Partial<FormValues> = {
  nationalId: "",
  type: "",
  status: "pending",
  details: "",
};

export default function CommunityRequestNewPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(CreateCommunityRequestBodySchema),
    defaultValues,
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await fetch("/api/community/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      reset();
      alert("บันทึกคำร้องสำเร็จ");
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-4 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-4">สร้างคำร้องชุมชนใหม่</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <label className="block font-medium">รหัสประชาชน</label>
          <input {...register("nationalId")}
                 className="border rounded w-full p-2" />
          {errors.nationalId && <p className="text-red-500 text-sm">{errors.nationalId.message}</p>}
        </div>
        <div className="mb-3">
          <label className="block font-medium">ประเภทคำร้อง</label>
          <input {...register("type")}
                 className="border rounded w-full p-2" />
          {errors.type && <p className="text-red-500 text-sm">{errors.type.message}</p>}
        </div>
        <div className="mb-3">
          <label className="block font-medium">รายละเอียด</label>
          <textarea {...register("details")}
                    className="border rounded w-full p-2" />
          {errors.details && <p className="text-red-500 text-sm">{errors.details.message}</p>}
        </div>
        <div className="mb-3">
          <label className="block font-medium">สถานะ</label>
          <select {...register("status")}
                  className="border rounded w-full p-2">
            <option value="pending">รอดำเนินการ</option>
            <option value="approved">อนุมัติ</option>
            <option value="rejected">ปฏิเสธ</option>
          </select>
          {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-4 py-2 rounded">
            {isSubmitting ? "กำลังบันทึก..." : "บันทึกคำร้อง"}
          </button>
          <button type="button" onClick={() => reset()} className="bg-gray-300 px-4 py-2 rounded">
            ล้างฟอร์ม
          </button>
        </div>
      </form>
    </div>
  );
}
