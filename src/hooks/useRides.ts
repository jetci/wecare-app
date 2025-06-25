"use client";
import useSWR from "swr";
import type { Ride } from '@/types/api';
import { fetcher } from '@/lib/fetcher';

/**
 * Fetch rides for a user
 */
export function useRides(userId: string | null) {
  const key = userId ? `/api/rides?userId=${userId}` : null;
  const { data, error, isLoading } = useSWR<any>(key, fetcher);
  // API may return an array or an object with { rides: Ride[] }
  const ridesData: Ride[] = Array.isArray(data)
    ? data
    : data?.rides ?? [];
  return { rides: ridesData, isLoading, error };
}
