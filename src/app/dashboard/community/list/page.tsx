"use client";

import React from 'react';
import { useCommunities } from '@/hooks/useCommunities';
import Skeleton from '@/components/Skeleton';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import RoleGuard from '@/components/RoleGuard';
import { Role } from '@/types/roles';
import { Community } from '@/types/community';

export default function CommunityListPage() {
  const { data = [], loading, error } = useCommunities();

  return (
    <RoleGuard allowedRoles={[Role.HEALTH_OFFICER]}>
      <div className="p-4">
        <h1 data-testid="community-header" className="text-2xl font-semibold mb-4">
          รายชื่อชุมชน
        </h1>

        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} data-testid="community-skeleton" height="2rem" width="100%" />
          ))
        ) : error ? (
          <p data-testid="community-error" className="text-red-600">
            {error}
          </p>
        ) : (
          <List
            height={400}
            itemCount={data.length}
            itemSize={50}
            width="100%"
            data-testid="community-virtualized-list"
            itemData={data}
          >
            {({ index, style, data: items }: ListChildComponentProps<Community[]>) => (
              <div style={style} data-testid="community-item">
                {items[index].name}
              </div>
            )}
          </List>
        )}
      </div>
    </RoleGuard>
  );
}
