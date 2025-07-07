import { renderHook } from '@testing-library/react-hooks';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useOfficerAppointments } from '@/hooks/useOfficerAppointments';

describe('useOfficerAppointments Hook', () => {
  const mockData = [{ id: '1', area: 'Area1', status: 'pending', date: new Date().toISOString() }];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches appointments successfully', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({ json: () => Promise.resolve(mockData) } as any);
    const { result, waitForNextUpdate } = renderHook(() => useOfficerAppointments());
    expect(result.current.isLoading).toBe(true);
    await waitForNextUpdate();
    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('handles fetch error', async () => {
    const error = new Error('fail');
    vi.spyOn(global, 'fetch').mockRejectedValue(error);
    const { result, waitForNextUpdate } = renderHook(() => useOfficerAppointments());
    await waitForNextUpdate();
    expect(result.current.error).toBe(error);
  });
});
