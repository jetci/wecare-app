'use client';

import useSWR from 'swr';
import { useAuth } from '@/context/AuthContext';
import { fetcher } from '@/lib/fetcher';
import { RequestUser } from '@prisma/client'; // Import Type from Prisma

// Interface สำหรับข้อมูล Meta ของ Pagination (ถ้ามี)
interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Interface สำหรับ Response ทั้งหมดจาก API
interface CommunityRequestsApiResponse {
  success: true;
  data: RequestUser[]; // ใช้ Type RequestUser จาก Prisma
  meta: Meta;
}

// Interface สำหรับ Parameters ที่ Hook รับเข้ามา (เผื่ออนาคต)
interface UseCommunityRequestsParams {
  page?: number;
  limit?: number;
}

export function useCommunityRequests(params: UseCommunityRequestsParams = {}) {
  const { token } = useAuth();

  // สร้าง Query String จาก Parameters
  const query = new URLSearchParams();
  if (params.page) query.append('page', String(params.page));
  if (params.limit) query.append('limit', String(params.limit));
  
  const queryString = query.toString();
  const apiUrl = `/api/community/requests?${queryString}`;

  // Key ของ SWR จะเปลี่ยนไปตาม apiUrl และ token
  const key = token ? [apiUrl, token] : null;

  const { data, error, isLoading, mutate } = useSWR<CommunityRequestsApiResponse>(key, fetcher);

  return {
    requests: data?.data ?? [], // ถ้ายังไม่มีข้อมูล ให้ return array ว่าง
    meta: data?.meta,
    isLoading,
    isError: !!error,
    mutate, // ส่ง mutate function ออกไปเพื่อให้ Component อื่นสามารถสั่ง re-fetch ได้
  };
} // [FIX] เพิ่มวงเล็บปีกกาปิดที่นี่
