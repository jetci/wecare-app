"use client";
import React from 'react';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const prefixes = ["นาย", "นาง", "นางสาว", "เด็กชาย", "เด็กหญิง"] as const;
const roles = ["COMMUNITY", "DRIVER", "HEALTH_OFFICER", "EXECUTIVE", "ADMIN"] as const;

const roleLabels: Record<typeof roles[number], string> = {
  COMMUNITY: 'ประชาชน',
  DRIVER: 'พนักงานขับรถ',
  HEALTH_OFFICER: 'เจ้าหน้าที่สาธารณสุข',
  EXECUTIVE: 'ผู้บริหาร',
  ADMIN: 'ผู้ดูแลระบบ',
}

export default function RegisterPage() {
  const [captchaA] = useState(() => Math.floor(Math.random() * 10));
  const [captchaB] = useState(() => Math.floor(Math.random() * 10));
  const captchaAnswer = captchaA + captchaB;

  const schema = z
    .object({
      prefix: z.enum(prefixes, { required_error: "เลือกคำนำหน้า" }),
      firstName: z.string().min(1, "กรุณากรอกชื่อ"),
      lastName: z.string().min(1, "กรุณากรอกนามสกุล"),
      nationalId: z.string().regex(/^\d{13}$/, "เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก"),
      phone: z.string().min(10, "เบอร์โทรศัพท์ต้องอย่างน้อย 10 หลัก").regex(/^\d+$/, "เบอร์โทรศัพท์ต้องเป็นตัวเลขเท่านั้น"),
      password: z
        .string()
        .min(6, "รหัสผ่านต้องอย่างน้อย 6 ตัว")
        .regex(/(?=.*\d)(?=.*\W)/, "ต้องมีตัวเลขและสัญลักษณ์"),
      confirmPassword: z.string(),
      role: z.enum(roles, { required_error: "เลือกบทบาท" }),
      captcha: z.string().min(1, "กรุณาตอบ captcha"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ["confirmPassword"],
      message: "รหัสผ่านไม่ตรงกัน",
    })
    .superRefine((data, ctx) => {
      if (Number(data.captcha) !== captchaAnswer) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["captcha"],
          message: "Captcha ไม่ถูกต้อง",
        });
      }
    });

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const prefix = watch("prefix");
  const gender = (prefix === "นาย" || prefix === "เด็กชาย") ? "ชาย" : "หญิง";

  const router = useRouter();

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, gender }),
      });
      const result = await res.json();
      if (!res.ok) {
        if (result.error === 'nationalId exists') {
          setError('nationalId', { type: 'manual', message: 'เลขบัตรประชาชนนี้ได้ลงทะเบียนแล้ว' });
          return;
        }
        throw new Error(result.error || "สมัครไม่สำเร็จ");
      }
      toast.success("สมัครสมาชิกสำเร็จ");
      router.push("/login");
    } catch (err: any) {
      toast.error(err.message || "เกิดข้อผิดพลาด");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4 text-center">สมัครสมาชิก</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Prefix */}
        <div>
          <label htmlFor="prefix" className="block mb-1">คำนำหน้า</label>
          <select id="prefix" {...register("prefix")} className="w-full p-2 border rounded">
            <option value="">เลือกคำนำหน้า</option>
            {prefixes.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <p className="text-red-500 text-sm">{errors.prefix?.message}</p>
        </div>
        {/* Name Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block mb-1">ชื่อ</label>
            <input id="firstName" {...register("firstName")} className="w-full border rounded p-2" />
            <p className="text-red-500 text-sm">{errors.firstName?.message}</p>
          </div>
          <div>
            <label htmlFor="lastName" className="block mb-1">นามสกุล</label>
            <input id="lastName" {...register("lastName")} className="w-full border rounded p-2" />
            <p className="text-red-500 text-sm">{errors.lastName?.message}</p>
          </div>
        </div>
        {/* Gender (แสดงเมื่อเลือกคำนำหน้าแล้ว) */}
        {prefix && (
          <div>
            <label htmlFor="gender" className="block mb-1">เพศ</label>
            <input id="gender" value={gender} readOnly className="w-full border bg-gray-100 rounded p-2" />
          </div>
        )}
        {/* National ID */}
        <div>
          <label htmlFor="nationalId" className="block mb-1">เลขบัตรประชาชน 13 หลัก</label>
          <input id="nationalId" {...register("nationalId")} maxLength={13} className="w-full border rounded p-2" />
          <p className="text-red-500 text-sm">{errors.nationalId?.message}</p>
        </div>
        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block mb-1">เบอร์โทรศัพท์</label>
          <input id="phone" {...register("phone")} maxLength={15} className="w-full border rounded p-2" />
          <p className="text-red-500 text-sm">{errors.phone?.message}</p>
        </div>
        {/* Passwords */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="password" className="block mb-1">รหัสผ่าน</label>
            <input id="password" type="password" {...register("password")} className="w-full border rounded p-2" />
            <p className="text-red-500 text-sm">{errors.password?.message}</p>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block mb-1">ยืนยันรหัสผ่าน</label>
            <input id="confirmPassword" type="password" {...register("confirmPassword")} className="w-full border rounded p-2" />
            <p className="text-red-500 text-sm">{errors.confirmPassword?.message}</p>
          </div>
        </div>
        {/* Role */}
        <div>
          <label htmlFor="role" className="block mb-1">บทบาทผู้ใช้</label>
          <select id="role" {...register("role")} className="w-full border rounded p-2">
            <option value="">เลือกบทบาท</option>
            {roles.map(r => (
              <option key={r} value={r}>{roleLabels[r]}</option>
            ))}
          </select>
          <p className="text-red-500 text-sm">{errors.role?.message}</p>
        </div>
        {/* Captcha */}
        <div>
          <label htmlFor="captcha" className="block mb-1">Captcha: {captchaA} + {captchaB} = ?</label>
          <input id="captcha" {...register("captcha")} className="w-full border rounded p-2" />
          <p className="text-red-500 text-sm">{errors.captcha?.message}</p>
        </div>
        {/* Submit */}
        <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded p-2 disabled:opacity-50">
          {isSubmitting ? "กำลังส่ง..." : "สมัครสมาชิก"}
        </button>
      </form>
    </div>
  );
}
