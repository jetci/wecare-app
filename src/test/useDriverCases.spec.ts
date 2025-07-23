import { renderHook, act } from '@testing-library/react-hooks';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { rest } from 'msw';
import { server } from '@/test/mocks/server';
import { useDriverCases } from '@/hooks/useDriverCases';
import { useAuth } from '@/context/AuthContext';

// Mock useAuth
vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock fetcher: let SWR call real fetcher, but intercept via MSW

describe('useDriverCases hook', () => {
  const mockCases = [
    { id: '1', status: 'pending', createdAt: '2025-01-01', driverId: null, patient: { name: 'A' } },
    { id: '2', status: 'accepted', createdAt: '2025-01-02', driverId: 'd1', patient: { name: 'B' } },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns data correctly on success', async () => {
    // mock token
    (useAuth as any).mockReturnValue({ token: 'token-123' });
    // mock API response
    server.use(
      rest.get('/api/driver/cases', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ success: true, cases: mockCases }));
      })
    );

    const { result, waitForNextUpdate } = renderHook(() => useDriverCases());

    // initial state: loading true
    expect(result.current.isLoading).toBe(true);

    await waitForNextUpdate();

    // after fetch
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.cases).toEqual(mockCases);
  });

  it('sets error on fetch failure', async () => {
    (useAuth as any).mockReturnValue({ token: 'token-123' });
    server.use(
      rest.get('/api/driver/cases', (req, res, ctx) => res(ctx.status(500)))
    );

    const { result, waitForNextUpdate } = renderHook(() => useDriverCases());

    expect(result.current.isLoading).toBe(true);
    await waitForNextUpdate();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(true);
    expect(result.current.cases).toEqual([]);
  });

  it('returns empty without fetching when no token', () => {
    (useAuth as any).mockReturnValue({ token: null });
    const { result } = renderHook(() => useDriverCases());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.cases).toEqual([]);
  });
});
