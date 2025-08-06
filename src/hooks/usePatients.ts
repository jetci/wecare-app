'use client';

import useSWR from 'swr';
import { useAuth } from '@/context/AuthContext';
import { fetcher } from '@/lib/fetcher';
import { Patient } from '@prisma/client';

// Interface for the API response
interface PatientsApiResponse {
  data: Patient[];
  meta: {
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  };
}

interface UsePatientsParams {
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * Custom hook to fetch patients with pagination and search.
 */
export function usePatients({ page = 1, limit = 10, search = '' }: UsePatientsParams = {}) {
  const { token } = useAuth();

  // Build the API endpoint with query parameters
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  if (search) {
    params.append('search', search);
  }
  const apiUrl = `/api/patients?${params.toString()}`;

  // SWR key changes based on the API URL and token
  const key = token ? [apiUrl, token] : null;

  const { data, error, isLoading, mutate } = useSWR<PatientsApiResponse>(key, fetcher, {
    keepPreviousData: true, // Keep previous data while re-fetching for better UX
  });

  return {
    patients: data?.data ?? [],
    meta: data?.meta,
    isLoading,
    isError: !!error,
    mutate,
  };
}
