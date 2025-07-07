"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import DatePicker, { registerLocale } from "react-datepicker";
import { format, parseISO } from "date-fns";
import { th } from "date-fns/locale/th";
import "react-datepicker/dist/react-datepicker.css";
import RoleGuard from "@/components/RoleGuard";
import DashboardLayout from "../layout";
import { Role } from "@/types/roles";
import MapPicker from "@/components/MapPicker";

registerLocale("th", th);

type FormData = {
  prefix: string;
  gender: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  bloodType: string;
  birthDate: string;
  phone: string;
  houseNumber: string;
  moo: string;
  tambon: string;
  amphoe: string;
  province: string;
  currentAddressSame: boolean;
  currentHouseNumber: string;
  currentMoo: string;
  currentSubDistrict: string;
  currentDistrict: string;
  currentProvince: string;
  location: { lat: number; lng: number };
  locationNote?: string;
};

export default function CommunityAddPatientPage() {
  const [mapCenter, setMapCenter] = useState({ lat: 19.911, lng: 99.214 });
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      prefix: "นาย",
      gender: "male",
      firstName: "",
      lastName: "",
      nationalId: "",
      bloodType: "ไม่ทราบ",
      birthDate: "",
      phone: "",
      houseNumber: "",
      moo: "1",
      tambon: "เวียง",
      amphoe: "ฝาง",
      province: "เชียงใหม่",
      currentAddressSame: false,
      currentHouseNumber: "",
      currentMoo: "",
      currentSubDistrict: "",
      currentDistrict: "",
      currentProvince: "",
      location: { lat: 19.911, lng: 99.214 },
      locationNote: "",
    },
  });

  // Center map on user location once
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((p) => {
      const loc = { lat: p.coords.latitude, lng: p.coords.longitude };
      setMapCenter(loc);
      setValue("location", loc);
    });
  }, [setValue]);

  const onSubmit = (data: FormData) => {
    console.log(data);
    // TODO: ส่งข้อมูลไป API
  };

  return (
    <RoleGuard allowedRoles={[Role.COMMUNITY]}>
      <DashboardLayout>
        <main className="max-w-3xl mx-auto p-6 space-y-8">
          <h1 className="text-3xl font-bold">ลงทะเบียนผู้ป่วย</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* … sections 1-4 … */}

            {/* Section 5: แผนที่ & หมายเหตุ */}
            <div className="bg-white p-4 rounded-lg shadow space-y-4">
              <h2 className="text-lg font-medium text-gray-700">
                ตำแหน่งที่อยู่ปัจจุบัน
              </h2>
              <div className="w-full h-64 rounded-lg overflow-hidden">
                <MapPicker
                  center={mapCenter}
                  onDragEnd={(coords) => {
                    setMapCenter(coords);
                    setValue("location", coords);
                  }}
                />
              </div>
              <label className="block text-sm font-medium text-gray-700">
                หมายเหตุเพิ่มเติม
              </label>
              <textarea
                {...register("locationNote")}
                className="w-full p-2 border rounded-lg"
                placeholder="เช่น ใกล้ป้าย..."
              />
            </div>

            {/* … sections 6+ … */}

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded"
            >
              บันทึก
            </button>
          </form>
        </main>
      </DashboardLayout>
    </RoleGuard>
  );
}