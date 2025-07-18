'use client';

import useSWR from 'swr';
import { useAuth } from '@/context/AuthContext';
import { fetcher } from '@/lib/fetcher';
import { Patient } from '@prisma/client'; // Import Type from Prisma

// Interface สำหรับ Response ทั้งหมดจาก API
interface PatientsApiResponse {
  success: true;
  patients: Patient[];
}

/**
 * Custom hook สำหรับดึงข้อมูลผู้ป่วยที่อยู่ในความดูแลของผู้ใช้ที่ล็อกอินอยู่
 */
export function usePatients() {
  const { token } = useAuth();

  // API endpoint สำหรับดึงข้อมูลผู้ป่วย
  const apiUrl = '/api/patients';

  // Key ของ SWR จะเปลี่ยนไปตาม apiUrl และ token
  const key = token ? [apiUrl, token] : null;

  const { data, error, isLoading, mutate } = useSWR<PatientsApiResponse>(key, fetcher);

  return {
    patients: data?.patients ?? [], // ถ้ายังไม่มีข้อมูล ให้ return array ว่าง
    isLoading,
    isError: !!error,
    mutate, // ส่ง mutate function ออกไปเพื่อให้ Component อื่นสามารถสั่ง re-fetch ได้
  };
}
