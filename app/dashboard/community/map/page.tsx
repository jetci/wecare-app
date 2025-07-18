"use client";
import React, { useState } from 'react';
import useSWR from 'swr';
import dynamic from 'next/dynamic';
import type { Location, MapProps } from '@/components/dashboard/community/Map';
import { Spinner } from '@/components/ui/Spinner';
import RoleGuard from '@/components/RoleGuard';
import { Role } from '@/types/roles';

const CommunityMap = dynamic<MapProps>(() => import('@/components/dashboard/community/Map'), {
  ssr: false,
  loading: () => <div role="status" className="p-4"><Spinner /></div>
});

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function CommunityMapPage({ params }: { params: { communityId: string } }) {
  const communityId = params.communityId;
  const { data: locations, error, isLoading } = useSWR<Location[]>(
    `/api/communities/${communityId}/locations`,
    fetcher
  );
  const [selected, setSelected] = useState<Location | null>(null);

  if (isLoading) return <div role="status" data-testid="loading-spinner" className="p-4"><Spinner /></div>;
  if (error) return <div role="alert" className="p-4 text-red-500">เกิดข้อผิดพลาดในการโหลดแผนที่</div>;

  return (
    <RoleGuard allowedRoles={[Role.COMMUNITY]}>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">แผนที่ชุมชน</h1>
        <CommunityMap locations={locations || []} onMarkerClick={setSelected} />
        {selected && (
          <div data-testid="location-detail" className="mt-4 p-4 border rounded">
            <h2 className="font-bold mb-1">{selected.name}</h2>
            <p>{selected.details}</p>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
