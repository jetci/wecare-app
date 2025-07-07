import { renderHook } from '@testing-library/react-hooks';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useOfficerPatients } from '@/hooks/useOfficerPatients';

describe('useOfficerPatients Hook', () => {
  const mockData = [{ id: '1', area: 'Area1' }];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches patients successfully', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({ json: () => Promise.resolve(mockData) } as any);
    const { result, waitForNextUpdate } = renderHook(() => useOfficerPatients());
    expect(result.current.isLoading).toBe(true);
    await waitForNextUpdate();
    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('handles fetch error', async () => {
    const error = new Error('fail');
    vi.spyOn(global, 'fetch').mockRejectedValue(error);
    const { result, waitForNextUpdate } = renderHook(() => useOfficerPatients());
    await waitForNextUpdate();
    expect(result.current.error).toBe(error);
  });
});
