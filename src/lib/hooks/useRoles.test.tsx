import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SWRConfig } from 'swr';
import { vi } from 'vitest';
import { useRoles, RoleItem } from '@/lib/hooks/useRoles';

function TestRoles({ enabled }: { enabled: boolean }) {
  const { data, error, isLoading } = useRoles(enabled);
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error fetching</div>;
  if (!data) return <div>No Data</div>;
  return (
    <ul>
      {data.roles.map((role: RoleItem) => (
        <li key={role.id}>{role.name}</li>
      ))}
    </ul>
  );
}

describe('useRoles hook and Roles UI', () => {
  afterEach(() => vi.restoreAllMocks());

  it('fallback when enabled=false', () => {
    render(
      <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map(), errorRetryCount: 0 }}>
        <TestRoles enabled={false} />
      </SWRConfig>
    );
    expect(screen.getByText('No Data')).toBeInTheDocument();
  });

  it('loading state', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(() => new Promise(() => {}));
    render(
      <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map(), errorRetryCount: 0 }}>
        <TestRoles enabled={true} />
      </SWRConfig>
    );
    expect(await screen.findByText('Loading...')).toBeInTheDocument();
  });

  it('success state', async () => {
    const roles: RoleItem[] = [{ id: '1', name: 'Admin', permissions: [] }];
    vi.spyOn(global, 'fetch').mockResolvedValue({ ok: true, json: async () => ({ roles }) } as unknown as Response);
    render(
      <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map(), errorRetryCount: 0 }}>
        <TestRoles enabled={true} />
      </SWRConfig>
    );
    expect(await screen.findByText('Admin')).toBeInTheDocument();
  });

  it('error state', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({ ok: false } as unknown as Response);
    render(
      <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map(), errorRetryCount: 0 }}>
        <TestRoles enabled={true} />
      </SWRConfig>
    );
    expect(await screen.findByText('Error fetching')).toBeInTheDocument();
  });
});
