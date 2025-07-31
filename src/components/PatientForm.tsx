"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientFormSchema, type PatientFormData } from "@/schemas/community/patient.schema";
import { useRouter } from "next/navigation";

const genderMap: Record<string, string> = {
  นาย: "ชาย",
  เด็กชาย: "ชาย",
  นาง: "หญิง",
  นางสาว: "หญิง",
  เด็กหญิง: "หญิง",
};

export interface PatientFormProps {
  onSuccess?: () => void;
}

const PatientForm: React.FC<PatientFormProps> = ({ onSuccess }) => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {},
  });

  const prefix = watch("prefix");
  const useId = watch("useIdCardAddress");
  const group = watch("patientGroup");

  useEffect(() => {
    if (prefix && genderMap[prefix]) {
      setValue("gender", genderMap[prefix] as any);
    }
  }, [prefix, setValue]);

  useEffect(() => {
    if (useId) {
      ["houseNumber","moo","tambon","amphoe","changwat","phone"].forEach(field => {
        setValue(
          `currentAddress_${field}` as any,
          watch(`idCardAddress_${field}` as any) as any
        );
      });
    }
  }, [useId, watch, setValue]);

  const onSubmit = async (data: PatientFormData) => {
    try {
      const resp = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error || "Unknown error");
      onSuccess?.();
      router.push("/community/requests");
    } catch (err: any) {
      alert("เกิดข้อผิดพลาด: " + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 1. ข้อมูลพื้นฐาน */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label>คำนำหน้า</label>
          <select {...register("prefix")} className="input">
            <option value="">-- เลือก --</option>
            {Object.keys(genderMap).map(k => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
          {errors.prefix && <p className="text-red-600">{errors.prefix.message}</p>}
        </div>
        <div>
          <label>ชื่อจริง</label>
          <input {...register("firstName")} className="input" />
          {errors.firstName && <p className="text-red-600">{errors.firstName.message}</p>}
        </div>
        <div>
          <label>นามสกุล</label>
          <input {...register("lastName")} className="input" />
          {errors.lastName && <p className="text-red-600">{errors.lastName.message}</p>}
        </div>
        <div>
          <label>วันเกิด</label>
          <input type="date" {...register("birthDate", { valueAsDate: true })} className="input" />
          {errors.birthDate && <p className="text-red-600">{errors.birthDate.message}</p>}
        </div>
        <div>
          <label>เลขบัตรประชาชน</label>
          <input {...register("nationalId")} className="input" />
          {errors.nationalId && <p className="text-red-600">{errors.nationalId.message}</p>}
        </div>
        <div>
          <label>เพศ</label>
          <input {...register("gender")} readOnly className="input bg-gray-100" />
        </div>
      </div>

      {/* 2. กลุ่มผู้ป่วย */}
      <div>
        <label>กลุ่มผู้ป่วย</label>
        <select {...register("patientGroup")} className="input">
          <option value="ผู้ยากไร้">ผู้ยากไร้</option>
          <option value="ผู้ป่วยติดเตียง">ผู้ป่วยติดเตียง</option>
          <option value="อื่นๆ">อื่นๆ</option>
        </select>
        {errors.patientGroup && <p className="text-red-600">{errors.patientGroup.message}</p>}
        {group === "อื่นๆ" && (
          <input {...register("otherPatientGroup")} placeholder="ระบุกลุ่มอื่นๆ" className="input mt-2" />
        )}
        {errors.prefix && <p className="text-red-600">{errors.prefix.message}</p>}
      </div>

      <div>
        <label className="block font-medium">ชื่อจริง</label>
        <input
          {...register("firstName")}
          className="mt-1 block w-full border rounded p-2"
        />
        {errors.firstName && <p className="text-red-600">{errors.firstName.message}</p>}
      </div>

      <div>
        <label className="block font-medium">นามสกุล</label>
        <input
          {...register("lastName")}
          className="mt-1 block w-full border rounded p-2"
        />
        {errors.lastName && <p className="text-red-600">{errors.lastName.message}</p>}
      </div>

      <div>
        <label className="block font-medium">เลขบัตรประชาชน</label>
        <input
          {...register("nationalId")}
          className="mt-1 block w-full border rounded p-2"
        />
        {errors.nationalId && <p className="text-red-600">{errors.nationalId.message}</p>}
      </div>

      <div>
        <label className="block font-medium">วันเกิด</label>
        <input
          type="date"
          {...register("birthDate", { valueAsDate: true })}
          className="mt-1 block w-full border rounded p-2"
        />
        {errors.birthDate && <p className="text-red-600">{errors.birthDate.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 bg-blue-600 text-white p-2 rounded"
      >
        {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
      </button>
    </form>
  );
};

export default PatientForm;
