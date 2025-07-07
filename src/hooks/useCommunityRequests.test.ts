import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, vi, beforeEach, afterEach, expect } from 'vitest';
import { useCommunityRequests } from './useCommunityRequests';
import { GetCommunityRequestsResponseSchema } from '@/schemas/community.schema';

const mockResponse = [
  {
    id: 1,
    nationalId: '1234567890123',
    type: 'help',
    status: 'pending',
    details: 'ต้องการความช่วยเหลือ',
    createdAt: new Date().toISOString(),
  },
];

describe('useCommunityRequests', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('ควรคืนค่า loading state ระหว่างโหลดข้อมูล', async () => {
    (fetch as any).mockImplementation(() => new Promise(() => {}));
    const { result } = renderHook(() => useCommunityRequests({}));
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);
  });

  it('ควรคืนข้อมูลสำเร็จและ validate ด้วย Zod', async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });
    const { result } = renderHook(() => useCommunityRequests({}));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual(
        GetCommunityRequestsResponseSchema.parse(mockResponse)
      );
      expect(result.current.error).toBe(null);
    });
  });

  it('ควรคืน error state เมื่อ fetch ล้มเหลว', async () => {
    (fetch as any).mockRejectedValue(new Error('network error'));
    const { result } = renderHook(() => useCommunityRequests({}));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('network error');
    });
  });

  it('ควรคืน error state เมื่อ response ไม่ตรง schema', async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => [{ foo: 'bar' }],
    });
    const { result } = renderHook(() => useCommunityRequests({}));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toMatch(/Invalid/);
    });
  });
});
