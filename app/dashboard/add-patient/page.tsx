"use client";
import React from "react";
import { useRouter } from "next/navigation";
import RoleGuard from "@/components/RoleGuard";
import { Role } from "@/types/roles";
import { AddPatientModal } from "@/components/community/AddPatientModal";

export default function AddPatientPage() {
  const router = useRouter();
  const handleClose = () => router.back();
  // ฟังก์ชันเรียกเมื่อเพิ่มผู้ป่วยสำเร็จ จะ redirect ไปยังหน้ารายชื่อผู้ป่วย
const handleSuccess = () => router.push("/dashboard/patients");

  return (
    <RoleGuard allowedRoles={[Role.OFFICER]}>
      <AddPatientModal isOpen onClose={handleClose} onSuccess={handleSuccess} />
    </RoleGuard>
  );
}