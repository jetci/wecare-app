"use client";
import useSWR from "swr";
import { fetcher } from '@/lib/fetcher';

export function usePatients(userId: string | null) {
  const key = userId ? `/api/patients?userId=${userId}` : null;
  const { data, error, isLoading } = useSWR<{ patients: any[] }>(key, fetcher);
  return {
    patients: data?.patients || [],
    isLoading,
    error,
  };
}
