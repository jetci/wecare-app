"use client";

import React from "react";
import useSWR from "swr";
import RoleGuard from "@/components/RoleGuard";
import DashboardLayout from "../../layout";
import { Role } from "@/types/roles";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface Ride {
  id: string;
  origin: string;
  destination: string;
  serviceType: string;
  requestedAt: string;
  status: string;
  vehicleLocation: [number, number];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CommunityTrackPage() {
  const { data: rides, error } = useSWR<Ride[]>("/api/rides?status=in-progress", fetcher);

  if (error) {
    return (
      <RoleGuard allowedRoles={[Role.COMMUNITY]}>
        <DashboardLayout role="community">
          <main className="p-4">
            <p className="text-red-600">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
          </main>
        </DashboardLayout>
      </RoleGuard>
    );
  }

  if (!rides) {
    return (
      <RoleGuard allowedRoles={[Role.COMMUNITY]}>
        <DashboardLayout role="community">
          <main className="p-4">กำลังโหลด...</main>
        </DashboardLayout>
      </RoleGuard>
    );
  }

  if (rides.length === 0) {
    return (
      <RoleGuard allowedRoles={[Role.COMMUNITY]}>
        <DashboardLayout role="community">
          <main className="p-4">ไม่มีคำขอที่กำลังดำเนินการ</main>
        </DashboardLayout>
      </RoleGuard>
    );
  }

  const ride = rides[0];
  return (
    <RoleGuard allowedRoles={[Role.COMMUNITY]}>
      <DashboardLayout role="community">
        <main className="p-4 flex flex-col lg:flex-row lg:space-x-6 space-y-6 lg:space-y-0">
          <section className="lg:w-1/2">
            <h1 className="text-2xl font-bold mb-4">ติดตามสถานะคำขอ</h1>
            <ul className="space-y-2">
              <li><strong>เวลา:</strong> {new Date(ride.requestedAt).toLocaleString("th-TH")}</li>
              <li><strong>ต้นทาง:</strong> {ride.origin}</li>
              <li><strong>ปลายทาง:</strong> {ride.destination}</li>
              <li><strong>ประเภท:</strong> {ride.serviceType}</li>
              <li><strong>สถานะ:</strong> {ride.status}</li>
            </ul>
          </section>
          <section className="lg:w-1/2 h-64 lg:h-auto">
            <MapContainer center={ride.vehicleLocation} zoom={13} className="w-full h-full rounded">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              <Marker position={ride.vehicleLocation}>
                <Popup>ตำแหน่งรถปัจจุบัน</Popup>
              </Marker>
            </MapContainer>
          </section>
        </main>
      </DashboardLayout>
    </RoleGuard>
  );
}
