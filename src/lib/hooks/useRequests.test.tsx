import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SWRConfig } from 'swr';
import { vi } from 'vitest';
import { useRequests, RequestsResp, RequestUser } from '@/lib/hooks/useRequests';

function TestRequests({ enabled }: { enabled: boolean }) {
  const { data, error, isLoading } = useRequests(enabled);
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error fetching</div>;
  if (!data) return <div>No Data</div>;
  return (
    <ul>
      {data.users.map((u: RequestUser) => (
        <li key={u.id}>{u.firstName} {u.lastName}</li>
      ))}
    </ul>
  );
}

describe('useRequests hook', () => {
  afterEach(() => vi.restoreAllMocks());

  it('fallback when enabled=false', () => {
    render(<TestRequests enabled={false} />);
    expect(screen.getByText('No Data')).toBeInTheDocument();
  });

  it('loading state', () => {
    vi.spyOn(global, 'fetch').mockImplementation(() => new Promise(() => {}));
    render(<TestRequests enabled={true} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('success state', async () => {
    const users: RequestUser[] = [{ id: '1', prefix: 'นาย', firstName: 'A', lastName: 'B', role: 'DRIVER' }];
    vi.spyOn(global, 'fetch').mockResolvedValue({ ok: true, json: async () => ({ users, total: 1 }) } as unknown as Response);
    render(
      <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
        <TestRequests enabled={true} />
      </SWRConfig>
    );
    expect(await screen.findByText('A B')).toBeInTheDocument();
  });

  it('error state', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({ ok: false, status: 500 } as unknown as Response);
    render(
      <SWRConfig value={{ dedupingInterval: 0, errorRetryCount: 0, provider: () => new Map() }}>
        <TestRequests enabled={true} />
      </SWRConfig>
    );
    expect(await screen.findByText('Error fetching')).toBeInTheDocument();
  });
});
