import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SWRConfig } from 'swr';
import { vi } from 'vitest';
import { useLogs, LogsResp, LogItem } from '@/lib/hooks/useLogs';

function TestLogs({ enabled, from = '', to = '', page = 1, limit = 10 }: Partial<{ enabled: boolean; from: string; to: string; page: number; limit: number }>) {
  const { data, error, isLoading } = useLogs(enabled ?? false, from, to, page, limit);
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error fetching</div>;
  if (!data) return <div>No Data</div>;
  return (
    <ul>
      {data.logs.map((l: LogItem) => (
        <li key={l.id}>{l.action}</li>
      ))}
    </ul>
  );
}

describe('useLogs hook', () => {
  afterEach(() => vi.restoreAllMocks());

  it('fallback when enabled=false', () => {
    render(<TestLogs enabled={false} />);
    expect(screen.getByText('No Data')).toBeInTheDocument();
  });

  it('loading state', () => {
    vi.spyOn(global, 'fetch').mockImplementation(() => new Promise(() => {}));
    render(<TestLogs enabled={true} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('success state', async () => {
    const logs: LogItem[] = [{ id: '1', user: 'user1', action: 'Login', timestamp: '', detail: '' }];
    vi.spyOn(global, 'fetch').mockResolvedValue({ ok: true, json: async () => ({ logs, total: 1 }) } as unknown as Response);
    render(
      <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
        <TestLogs enabled={true} from="2025-01-01" to="2025-01-31" page={1} limit={10} />
      </SWRConfig>
    );
    expect(await screen.findByText('Login')).toBeInTheDocument();
  });

  it('error state', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({ ok: false, status: 500 } as unknown as Response);
    render(
      <SWRConfig value={{ dedupingInterval: 0, errorRetryCount: 0, provider: () => new Map() }}>
        <TestLogs enabled={true} from="2025-01-01" to="2025-01-31" page={1} limit={10} />
      </SWRConfig>
    );
    expect(await screen.findByText('Error fetching')).toBeInTheDocument();
  });
});
