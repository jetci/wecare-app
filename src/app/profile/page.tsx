"use client";

import React from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

const fetcher = async (url: string) => {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } });
  if (!res.ok) {
    const error: any = new Error("An error occurred while fetching the data.");
    // Attach extra info to the error object
    error.info = await res.json().catch(() => ({ message: res.statusText })); // Add response body if available
    error.status = res.status;
    throw error;
  }
  return res.json();
};

export default function ProfilePage() {
  const router = useRouter();
  const { data, error, isLoading } = useSWR("/api/auth/profile", fetcher, { revalidateOnMount: true });

  if (error) {
    if (error.status === 401 || error.status === 403) {
      router.push("/login");
      return null; // Stop rendering further if redirecting
    }
    // For other errors, display the message
    return (
      <div className="p-6 text-center text-red-500">
        <p>ไม่สามารถโหลดข้อมูลผู้ใช้ได้</p>
        {error.info?.message && <p className="text-sm">({error.info.message})</p>}
      </div>
    );
  }

  if (!isLoading && !data?.user) {
    // Case where fetch was successful but no user data (e.g., user deleted but token still valid for a moment)
    return (
      <div className="p-6 text-center text-red-500">
        <p>ไม่สามารถโหลดข้อมูลผู้ใช้ได้</p>
        <p className="text-sm">(ไม่พบข้อมูลผู้ใช้)</p>
      </div>
    );
  }
  if (isLoading) return <div className="p-6"><Spinner /></div>;

  const user = data.user;
  return (
    <div className="p-6">
      <Card>
        <h2 className="text-xl font-semibold mb-4">ข้อมูลส่วนตัว</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex justify-center items-center">
            {user.avatarUrl ? (
              <Image src={user.avatarUrl} width={120} height={120} alt="Avatar" className="rounded-full" />
            ) : (
              <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center text-2xl">?</div>
            )}
          </div>
          <div className="space-y-2">
            <p><span className="font-semibold">ชื่อ:</span> {user.firstName || <span className="text-red-500">กรุณาเพิ่มข้อมูล</span>}</p>
            <p><span className="font-semibold">นามสกุล:</span> {user.lastName || <span className="text-red-500">กรุณาเพิ่มข้อมูล</span>}</p>
            <p><span className="font-semibold">เลขบัตรประชาชน:</span> {user.nationalId || <span className="text-red-500">กรุณาเพิ่มข้อมูล</span>}</p>
            <p className="mt-2 font-semibold">ที่อยู่:</p>
            <p className="ml-4">บ้านเลขที่: {user.address?.houseNumber || <span className="text-red-500">กรุณาเพิ่มข้อมูล</span>}</p>
            <p className="ml-4">หมู่ที่: {user.address?.village || <span className="text-red-500">กรุณาเพิ่มข้อมูล</span>}</p>
            <p className="ml-4">ตำบล: {user.address?.subdistrict || <span className="text-red-500">กรุณาเพิ่มข้อมูล</span>}</p>
            <p className="ml-4">อำเภอ: {user.address?.district || <span className="text-red-500">กรุณาเพิ่มข้อมูล</span>}</p>
            <p className="ml-4">จังหวัด: {user.address?.province || <span className="text-red-500">กรุณาเพิ่มข้อมูล</span>}</p>
            <p><span className="font-semibold">เบอร์โทร:</span> {user.phone || <span className="text-red-500">กรุณาเพิ่มข้อมูล</span>}</p>
          </div>
        </div>
        <div className="mt-6 text-right">
          <Link href="/profile/edit">
            <button className="px-4 py-2 bg-blue-600 text-white rounded">แก้ไขข้อมูล</button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
