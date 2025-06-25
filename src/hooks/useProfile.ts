"use client";
import useSWR from "swr";
import type { ApiProfile } from '@/types/api';
import { fetcher } from '@/lib/fetcher';

export function useProfile() {
  const { data, error, isLoading } = useSWR<{ user: ApiProfile }>(
    "/api/auth/profile",
    fetcher
  );
  return { profile: data?.user || null, error, isLoading };
}
