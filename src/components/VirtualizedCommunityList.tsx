import React from 'react';
import { useCommunities } from '@/hooks/useCommunities';
import Skeleton from '@/components/Skeleton';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import RoleGuard from '@/components/RoleGuard';
import { Role } from '@/types/roles';

export default function VirtualizedCommunityList() {
  const { data = [], loading, error } = useCommunities();

  if (loading) {
    return (
      <RoleGuard allowedRoles={[Role.HEALTH_OFFICER]}>
        <div className="p-4">
          <h1 data-testid="community-header" className="text-2xl font-semibold mb-4">รายชื่อชุมชน</h1>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} dataTestId="community-skeleton" height="2rem" width="100%" />
          ))}
        </div>
      </RoleGuard>
    );
  }

  if (error) {
    return (
      <RoleGuard allowedRoles={[Role.HEALTH_OFFICER]}>
        <div className="p-4">
          <h1 data-testid="community-header" className="text-2xl font-semibold mb-4">รายชื่อชุมชน</h1>
          <p data-testid="community-error" className="text-red-600">{error}</p>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={[Role.HEALTH_OFFICER]}>
      <div className="p-4">
        <h1 data-testid="community-header" className="text-2xl font-semibold mb-4">รายชื่อชุมชน</h1>
        <div style={{ position: 'relative', height: 400, width: '100%' }} data-testid="community-virtualized-list">
          <List
            height={400}
            itemCount={data.length}
            itemSize={50}
            width="100%"
            itemData={data}
          >
            {({ index, style, data: items }: ListChildComponentProps<typeof data>) => (
              <div style={style} data-testid="community-item">{items[index].name}</div>
            )}
          </List>
        </div>
      </div>
    </RoleGuard>
  );
}
